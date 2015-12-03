"use strict";

/**
 * imgix image tag
 *
 * api: https://www.imgix.com/docs/reference
 *
 * Syntax:
 * {% imgix https://s3.amazonaws.com/example-bucket/example.jpg [param=value,param=value] [class1,class2,classN] [JSONImageAttributes] %}
 */

const url = require("url");
const qs = require("qs");

const isValid = function (path, parts) {
  return parts.indexOf(path) > -1;
};

const replaceArray = function (str, replacement, patterns) {

  patterns = patterns || [];
  const oStr = str;

  for (let pattern of patterns) {
    if (oStr === str) {
      str = str.replace(new RegExp(`^(https:|http:)?(//)?${pattern}`), replacement);
    }
  }

  return str;
};

const buildSrc = function (path, settings, params) {

  const parsed = url.parse(path);

  if (!params && parsed.query) {
    params = qs.parse(parsed.query);
  } else {
    params = qs.parse(settings["default_params"]);
  }

  const path2 = replaceArray(path, "", settings.replace);

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

const makeAttrs = function (attrs) {
  const attrArr = [];
  for (let attr in attrs) {
    attrArr.push(`${attr}="${attrs[attr]}"`);
  }
  return attrArr.join(" ");
};

const imgix = function (imageUrl, params, classes, imgAttr) {

  const settings = hexo.config.imgix || {};

  settings.domain = settings.domain || "";
  settings.replace = settings.replace || [];
  settings.default_params = settings["default_params"] || "";

  classes = classes ? classes.split(",") : [];
  imgAttr = imgAttr ? JSON.parse(imgAttr) : {};

  imgAttr.src   = buildSrc(imageUrl, settings, params);
  imgAttr.class = classes.join(" ");

  return `<img ${makeAttrs(imgAttr)} />`;
};

const tag = function (args) {
  return imgix(...args);
};

hexo.extend.tag.register("imgix", imgix);
hexo.extend.helper.register("imgix", imgix);
