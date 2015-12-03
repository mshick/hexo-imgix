"use strict";

const url = require("url");
const qs = require("qs");

const isEmptyObject = function (obj) {
  return Object.keys(obj) === 0;
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

const buildParams = function (parsedPath, settings, rawParams) {

  let params = {};

  if (isEmptyObject(rawParams) && parsedPath.query) {
    params = qs.parse(parsedPath.query);
  } else if (isEmptyObject(rawParams)) {
    params = qs.parse(settings["default_params"]);
  } else {
    params = rawParams;
  }

  if (params.profile && settings.profiles[params.profile]) {
    const profileParams = qs.parse(settings.profiles[params.profile]);
    params = Object.assign(profileParams, params);
    delete params.profile;
  }

  return params;
};

const buildSrc = function (path, settings, params) {

  const path2 = replacePathArr(path, settings.replace || [], "");

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

const buildSrcSet = function (path, params, options) {

  const scales = options.scales || {};
  const settings = options.settings || {};

  const scaleSources = function (scale) {
    if (params && params.w) {
      const p = Object.assign({}, params);
      p.w = Math.floor(parseInt(p.w, 10) * scale);
      return {
        src: buildSrc(path, settings, p),
        width: p.w
      };
    }
  };

  const makeString = function (img) {
    return `${img.src} ${img.width}w`;
  };

  return scales.map(scaleSources).map(makeString).join(", ");
};

const buildAttrs = function (imageUrl, rawParams, settings) {

  const attrs = {};

  const parsed = url.parse(imageUrl);
  const params = buildParams(parsed, settings, rawParams);

  attrs.src = buildSrc(imageUrl, settings, params);

  if (settings["src_set"] && params.w) {

    const options = {
      scales: settings["src_set"],
      settings
    };

    attrs.srcset = buildSrcSet(imageUrl, params, options);

  } else {
    if (params.w) {
      attrs.width = params.w;
    }

    if (params.h) {
      attrs.height = params.h;
    }
  }

  return attrs;
};

const htmlAttrs = function (attrs) {
  const attrArr = [];
  for (const attr in attrs) {
    const val = attrs[attr];
    if (val === true) {
      attrArr.push(attr);
    } else {
      attrArr.push(`${attr}="${val}"`);
    }
  }
  return attrArr.join(" ");
};

module.exports = function (config) {

  config = config || {};

  return function (imageUrl, params, options) {

    options = options || {};

    if (!imageUrl) {
      return "<!-- hexo-tag-imgix: Please provide a url to your asset -->";
    }

    const settings = {
      domain: "",
      replace: [],
      profiles: {},
      "default_params": ""
    };

    Object.assign(settings, config);

    const attrs = buildAttrs(imageUrl, params, settings);

    Object.assign(attrs, options.attrs || {});

    if (options.classes) {
      attrs.class = options.classes.join(" ");
    }

    return `<img ${htmlAttrs(attrs)} />`;
  };
};
