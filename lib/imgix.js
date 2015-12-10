"use strict";

const url = require("url");
const qs = require("qs");
const clone = require("clone");
const compact = require("./utils/compact-object");

const identity = (x) => x;

const isScale = function (n) {
  return n === Number(n) && n % 1 !== 0 || n === 1;
};

const matchUrlRe = function (matchUrl, flags) {
  return new RegExp(`^(https:|http:)?(//)?${matchUrl}`, flags);
};

const findProfile = function (imageUrl, profiles) {
  for (const profile of profiles.reverse()) {
    if (matchUrlRe(profile.match).test(imageUrl)) {
      return clone(profile);
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

  const parsed = url.parse(imageUrl);
  const queryParams = qs.parse(parsed.query);
  const params = Object.assign({}, rawParams, queryParams);

  const initialProfile = findProfile(imageUrl, options.profiles);
  const profile = initialProfile || {};

  profile.params = Object.assign({}, profile.params, params);

  if (options.attrs) {
    const dim = findDimensions(profile.params, options.attrs);
    profile.params.w = dim.w || profile.params.w;
    profile.params.h = dim.h || profile.params.h;
  }

  return compact(profile);
};

const buildSrc = function (path, profile) {

  const path2 = path.replace(matchUrlRe(profile.match), "");

  if (path !== path2) {
    const protocol = profile["secure_url"] ? "https" : "http";
    const host = profile.domain;
    const pathname = path2.replace(/\?$/, "").replace(/^https?/, "").replace(/^:?\/\//, "");
    const query = profile.params;
    return url.format({ protocol, host, pathname, query });
  } else {
    return path;
  }
};

const buildSrcset = function (path, profile) {

  const params = profile.params;
  const srcset = profile.srcset || {};
  const scale = srcset.scale || [];
  const min = srcset.min || 0;
  const max = srcset.max || Infinity;

  const scaleSources = function (scl) {

    if (!params.w || !isScale(scl)) {
      return null;
    }

    // Width is set, height unset, and clip can be overridden
    const width = Math.floor(parseInt(params.w, 10) * scl);

    // Clone initial profile and update vals
    const cloned = clone(profile);
    cloned.params.fit = cloned.params.fit || "clip";
    cloned.params.w = scl.toFixed(2);
    delete cloned.params.h;

    // Build a new src from the modifed profile
    const src = buildSrc(path, cloned);

    // Only return if this fits our constraints
    if (width > min && width < max) {
      return { src, width };
    }
  };

  const makeString = function (img) {
    return `${img.src} ${img.width}w`;
  };

  return scale.map(scaleSources).filter(identity).map(makeString).join(", ");
};

const buildAttrs = function (imageUrl, profile) {

  const attrs = {};

  attrs.src = buildSrc(imageUrl, profile);

  if (profile.srcset && profile.params.w) {
    attrs.srcset = buildSrcset(imageUrl, profile);
    attrs.sizes = profile.srcset.sizes || "100vw";
  }

  if (profile.params.w && profile.params.h) {
    attrs.width = profile.params.w;
    attrs.height = profile.params.h;
  }

  return attrs;
};

module.exports = function (imageUrl, profiles, options) {

  options = options || {};
  profiles = profiles || [];

  const params = options.params || {};

  if (!imageUrl) {
    return null;
  }

  const profileOpts = {
    profiles: [].concat(profiles),
    attrs: options.attrs
  };

  if (options.profile) {
    const filtered = profiles.filter((x) => x.name === options.profile);
    profileOpts.profiles = filtered.reverse();
  }

  const profile = buildProfile(imageUrl, params, profileOpts);

  return buildAttrs(imageUrl, profile);
};
