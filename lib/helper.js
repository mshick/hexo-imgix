"use strict";

const url = require("url");
const qs = require("qs");
const util = require("hexo-util");
const htmlTag = util.htmlTag;

const identity = (x) => x;

const isEmptyObject = function (obj) {
  return Object.keys(obj) === 0;
};

const isScale = function (n) {
  return n === Number(n) && n % 1 !== 0 || n === 1;
};

const compactObject = function (obj) {

  if (!(obj instanceof Object)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.filter((x) => compactObject(x));
  }

  const compacted = {};

  for (const prop in obj) {
    // Prevent empty params from persisting

    let val = obj[prop];

    if (val instanceof Object) {
      val = compactObject(val);
    }

    if (val !== null && val !== undefined) {
      compacted[prop] = val;
    }
  }

  if (isEmptyObject(compacted)) {
    return null;
  }

  return compacted;
};

const initialProfile = function (profileName, profiles, params) {

  const remove = {
    domain: null,
    profile: null,
    srcset: null
  };

  const paramsSrcset = params.srcset;
  const paramsParams = Object.assign({}, params, remove);

  const profile = profiles[profileName] || {};

  return {
    domain: params.domain || profile.domain || profiles.DEFAULT.domain,
    srcset: Object.assign({}, profile.srcset, paramsSrcset),
    params: Object.assign({}, profile.params, paramsParams)
  };
};

const matchUrlRe = function (matchUrl, flags) {
  return new RegExp(`^(https:|http:)?(//)?${matchUrl}`, flags);
};

const replacePathArr = function (str, patterns, replacement) {

  const oStr = str;

  for (const pattern of patterns) {
    str = str.replace(matchUrlRe(pattern), replacement);
    if (str !== oStr) {
      break;
    }
  }

  return str;
};

const findProfile = function (imageUrl, match) {
  for (const m of match) {
    if (matchUrlRe(m.url).test(imageUrl)) {
      return m.profile;
    }
  }
};

const findDimensions = function (params, attrs) {

  // Explicitly set height/width are presumed to be source,
  // treat profile as the max dimension

  let w;
  let h;

  if (attrs.width) {
    const width = parseInt(attrs.width, 10);
    if (params.w && width) {
      w = Math.min(params.w, width);
    } else if (width) {
      w = width;
    }
  }

  if (attrs.height) {
    const height = parseInt(attrs.height, 10);
    if (params.h && height) {
      h = Math.min(params.h, height);
    } else if (height) {
      h = height;
    }
  }

  return { w, h };
};

const buildProfile = function (imageUrl, rawParams, options) {

  const settings = options.settings;
  const user = options.user;
  const parsed = url.parse(imageUrl);

  let initialParams = rawParams;

  if (isEmptyObject(initialParams) && parsed.query) {
    initialParams = qs.parse(parsed.query);
  }

  const profileName = initialParams.profile || findProfile(imageUrl, settings.match) || "DEFAULT";
  const profile = initialProfile(profileName, settings.profiles, initialParams);

  if (user.attrs) {
    const dim = findDimensions(profile.params, user.attrs);
    profile.params.w = dim.w || profile.params.w;
    profile.params.h = dim.h || profile.params.h;
  }

  return compactObject(profile);
};

const buildSrc = function (path, profile, settings) {

  const replacements = settings.match ? settings.match.map((m) => m.url) : [];
  const path2 = replacePathArr(path, replacements, "");

  if (path !== path2) {
    const protocol = settings["secure_url"] ? "https" : "http";
    const host = profile.domain;
    const pathname = path2.replace(/\?$/, "").replace(/^https?/, "").replace(/^:?\/\//, "");
    const query = profile.params;
    return url.format({ protocol, host, pathname, query });
  } else {
    return path;
  }
};

const buildSrcset = function (path, options) {

  const settings = options.settings;
  const profile = Object.assign({}, options.profile);
  const params = profile.params;
  const srcset = profile.srcset || {};
  const scale = srcset.scale || [];
  const min = srcset.min || 0;
  const max = srcset.max || Infinity;

  const scaleSources = function (scl) {
    if (params.w && isScale(scl)) {
      // Width is set, height unset, and clip can be overridden
      const width = Math.floor(parseInt(params.w, 10) * scl);

      profile.params = Object.assign({ fit: "clip" }, params);
      profile.params.w = scl.toFixed(2);

      delete profile.params.h;

      if (width > min && width < max) {
        return {
          src: buildSrc(path, profile, settings),
          width
        };
      }
    }
  };

  const makeString = function (img) {
    return `${img.src} ${img.width}w`;
  };

  return scale.map(scaleSources).filter(identity).map(makeString).join(", ");
};

const buildAttrs = function (imageUrl, profile, settings) {

  const attrs = {};

  attrs.src = buildSrc(imageUrl, profile, settings);

  if (profile.srcset && profile.params.w) {
    attrs.srcset = buildSrcset(imageUrl, { profile, settings });
    attrs.sizes = profile.srcset.sizes || "100vw";
  }

  if (profile.params.w && profile.params.h) {
    attrs.width = profile.params.w;
    attrs.height = profile.params.h;
  }

  return attrs;
};

const getSettings = function (config) {

  const defaults = {
    match: [],
    profiles: {}
  };

  const settings = Object.assign(defaults, config);

  if (typeof config.match === "string") {
    settings.match = [{ url: config.match }];
  }

  if (!config.profiles) {
    const DEFAULT = {
      domain: config.domain,
      "secure_url": config.secure_url,
      params: config.params,
      srcset: config.srcset
    };
    settings.profiles.DEFAULT = compactObject(DEFAULT);
  }

  settings.profiles.DEFAULT = settings.profiles.DEFAULT || {};

  return settings;
};

const buildHtmlAttrs = function (generated, user) {

  const htmlAttrs = Object.assign({}, user.attrs, generated);

  // Always set these
  htmlAttrs.src = generated.src;

  if (generated.srcset) {
    htmlAttrs.srcset = generated.srcset;
    htmlAttrs.sizes = generated.sizes;
  }

  if (user.classes) {
    htmlAttrs.class = user.classes.join(" ");
  }

  return htmlAttrs;
};

module.exports = function (ctx) {

  const config = ctx.config.imgix || {};

  return function (imageUrl, rawParams, options) {

    options = options || {};

    if (!imageUrl) {
      return "<!-- hexo-helper-imgix: Please provide a url to your asset -->";
    }

    const settings = getSettings(config);
    const profile = buildProfile(imageUrl, rawParams, { settings, user: options });
    const attrs = buildAttrs(imageUrl, profile, settings);

    const htmlAttrs = buildHtmlAttrs(attrs, options);

    if (options.noRender) {
      return htmlAttrs;
    }

    return htmlTag("img", htmlAttrs);
  };
};
