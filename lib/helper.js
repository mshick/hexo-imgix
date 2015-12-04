/* eslint max-statements:0 */

"use strict";

const url = require("url");
const qs = require("qs");
const util = require("hexo-util");
const htmlTag = util.htmlTag;

const isEmptyObject = function (obj) {
  return Object.keys(obj) === 0;
};

const cleanObject = function (obj) {
  const cleaned = {};
  if (obj) {
    for (const i in obj) {
      // Prevent empty params from persisting
      if (obj[i]) {
        cleaned[i] = obj[i];
      }
    }
  }
  return cleaned;
};

const replacePathArr = function (str, patterns, replacement) {

  const oStr = str;

  for (const pattern of patterns) {
    if (oStr === str) {
      str = str.replace(new RegExp(`^(https:|http:)?(//)?${pattern}`), replacement);
    }
  }

  return str;
};

const buildParams = function (parsedPath, rawParams, options) {

  let params = {};

  if (isEmptyObject(rawParams) && parsedPath.query) {
    params = qs.parse(parsedPath.query);
  } else if (rawParams) {
    params = rawParams;
  }

  if (params.profile && options.profiles[params.profile]) {
    const profileParams = Object.assign({}, options.profiles[params.profile]);
    params = Object.assign(profileParams, params);
    delete params.profile;
  }

  if (isEmptyObject(rawParams) && options.profiles.DEFAULT) {
    params = options.profiles.DEFAULT;
  }

  if (options.attrs) {
    // Explicitly set height/width are presumed to be source, and override all
    const attrs = options.attrs;
    params.w = attrs.width ? parseInt(attrs.width, 10) : params.w;
    params.h = attrs.height ? parseInt(attrs.height, 10) : params.h;
  }

  return cleanObject(params);
};

const buildSrc = function (path, settings, params) {

  const path2 = replacePathArr(path, settings.match || [], "");

  if (path !== path2) {
    const protocol = settings["secure_url"] ? "https" : "http";
    const host = settings.domain;
    const pathname = path2.replace(/\?$/, "").replace(/^https?/, "").replace(/^:?\/\//, "");
    const query = params;
    return url.format({ protocol, host, pathname, query });
  } else {
    return path;
  }
};

const buildSrcset = function (path, params, settings) {

  const srcset = settings.srcset || {};
  const scale = srcset.scale || [];
  const min = srcset.min;
  const max = srcset.max;

  const scaleSources = function (scl) {
    if (params && params.w) {
      const p = Object.assign({}, params);
      p.w = Math.floor(parseInt(p.w, 10) * scl);
      delete p.h;
      if (p.w > min && p.w < max) {
        return {
          src: buildSrc(path, settings, p),
          width: p.w
        };
      }
    }
  };

  const identity = (x) => x;

  const makeString = function (img) {
    return `${img.src} ${img.width}w`;
  };

  return scale.map(scaleSources).filter(identity).map(makeString).join(", ");
};

const buildAttrs = function (imageUrl, params, settings) {

  const attrs = {};

  attrs.src = buildSrc(imageUrl, settings, params);

  if (settings.srcset && params.w) {
    attrs.srcset = buildSrcset(imageUrl, params, settings);
  }

  if (params.w) {
    attrs.width = params.w;
  }

  if (params.h) {
    attrs.height = params.h;
  }

  return attrs;
};

module.exports = function (ctx) {

  const config = ctx.config.imgix || {};

  return function (imageUrl, rawParams, options) {

    options = options || {};

    if (!imageUrl) {
      return "<!-- hexo-helper-imgix: Please provide a url to your asset -->";
    }

    const settings = {
      domain: "",
      match: [],
      profiles: {}
    };

    Object.assign(settings, config);

    const parsed = url.parse(imageUrl);
    const params = buildParams(parsed, rawParams, Object.assign({}, settings, options));
    const attrs = buildAttrs(imageUrl, params, settings);

    Object.assign(attrs, options.attrs || {});

    if (options.classes) {
      attrs.class = options.classes.join(" ");
    }

    if (options.noRender) {
      return attrs;
    }

    return htmlTag("img", attrs);
  };
};
