"use strict";

const util = require("hexo-util");
const imgix = require("./imgix");
const buildHtmlAttrs = require("./utils/build-html-attrs");
const htmlTag = util.htmlTag;


module.exports = function (profiles) {

  return function (imageUrl, options) {

    options = options || {};

    if (!imageUrl) {
      return "<!-- hexo-imgix: No asset url provided -->";
    }

    const attrs = imgix(imageUrl, profiles, options);
    const htmlAttrs = buildHtmlAttrs(attrs, options.attrs);

    return htmlTag("img", htmlAttrs);
  };
};
