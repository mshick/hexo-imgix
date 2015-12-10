"use strict";

const cheerio = require("cheerio");
const util = require("hexo-util");
const imgix = require("./imgix");
const buildHtmlAttrs = require("./utils/build-html-attrs");
const htmlTag = util.htmlTag;

const mapFound = function (profile, $) {

  return function (element) {

    const search = $.html(element);
    const attrs = $(element).attr();
    const imgixAttrs = imgix(attrs.src, [profile], { attrs });
    const htmlAttrs = buildHtmlAttrs(imgixAttrs, attrs);
    const replace = htmlTag("img", htmlAttrs);

    return {
      search,
      replace
    };
  };
};

const replaceFound = function (content, replacements) {
  for (const rep of replacements) {
    content = content.replace(rep.search, rep.replace);
  }
  return content;
};

const updateTags = function (content, profiles) {

  const $ = cheerio.load(content);
  const found = [];

  let replacements = [];

  const pushFound = function (i, el) {
    found.push(el);
  };

  for (const profile of profiles) {
    $(`img[src*="${profile.match}"]`).each(pushFound);
    const replace = found.map(mapFound(profile, $));
    replacements = replacements.concat(replace);
  }

  return replaceFound(content, replacements);
};

module.exports = function (profiles) {

  return function (data) {

    let hasMatch = false;

    for (const profile of profiles.reverse()) {
      const re = new RegExp(profile.match, "i");
      if (re.test(data.content)) {
        hasMatch = true;
        break;
      }
    }

    if (hasMatch) {
      data.content = updateTags(data.content, profiles);
    }
  };
};
