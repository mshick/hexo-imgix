"use strict";

const util = require("hexo-util");
const imgix = require("./imgix");
const buildHtmlAttrs = require("./utils/build-html-attrs");
const htmlTag = util.htmlTag;

const rUrl = /^(https?:\/\/|\/\/)+/i;
const rParam = /\w+:\w+/;
const rMeta = /["']?([^"']+)?["']?\s*["']?([^"']+)?["']?/;

const toObject = function (arr) {
  const obj = {};
  arr.forEach((param) => {
    const parts = param.split(":");
    obj[parts[0]] = parts[1];
  });
  return obj;
};

const parseFirstArgs = function (args) {

  const classes = [];
  const params = [];

  let src;
  let index;

  // Find image URL and class name
  for (index of args.keys()) {
    const arg = args[index];
    if (rUrl.test(arg)) {
      src = arg;
      break;
    } else if (arg[0] === "/") {
      src = arg;
      break;
    } else if (rParam.test(arg)) {
      params.push(arg);
    } else {
      classes.push(arg);
    }
  }

  return {
    src,
    classes,
    params,
    lastIndex: index
  };
};

const parseSecondArgs = function (args) {

  let meta;
  let width;
  let height;

  // Find image width and height
  if (args.length) {
    if (!/\D+/.test(args[0])) {
      width = args.shift();
      if (args.length && !/\D+/.test(args[0])) {
        height = args.shift();
      }
    }
    meta = args.join(" ");
  }

  return {
    width,
    height,
    meta
  };
};

module.exports = function (profiles) {

  return function (args) {

    const firstArgs = parseFirstArgs(args);
    const src = firstArgs.src;
    const classes = firstArgs.classes;
    const params = firstArgs.params;

    args = args.slice(firstArgs.lastIndex + 1);

    const attrs = parseSecondArgs(args);

    // Find image title and alt
    if (attrs.meta && rMeta.test(attrs.meta)) {
      const match = attrs.meta.match(rMeta);
      attrs.title = match[1];
      attrs.alt = match[2];
      delete attrs.meta;
    }

    const options = {
      classes,
      attrs,
      params: toObject(params),
      noRender: true
    };

    const imgixAttrs = imgix(src, profiles, options);
    const htmlAttrs = buildHtmlAttrs(imgixAttrs, options.attrs);

    return htmlTag("img", htmlAttrs);
  };
};
