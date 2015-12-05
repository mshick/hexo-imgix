"use strict";

const cheerio = require("cheerio");
const helper = require("./helper");

const noOp = function () {};

const mapFound = function (match, $, ctx) {

  return function (element) {
    const search = $.html(element);
    const attrs = $(element).attr();
    const replace = helper(ctx)(attrs.src, {}, { attrs });
    return { search, replace };
  };
};

const replaceFound = function (content, replacements) {
  for (const rep of replacements) {
    content = content.replace(rep.search, rep.replace);
  }
  return content;
};

const updateTags = function (content, matches, ctx) {

  const $ = cheerio.load(content);
  const found = [];

  let replacements = [];

  const pushFound = function (i, el) {
    found.push(el);
  };

  for (const match of matches) {
    $(`img[src*="${match.url}"]`).each(pushFound);
    const mapFn = mapFound(match, $, ctx);
    replacements = replacements.concat(found.map(mapFn));
  }

  return replaceFound(content, replacements);
};

module.exports = function (ctx) {

  const config = ctx.config.imgix;
  const logger = ctx.log;

  if (!config.match || !Array.isArray(config.match)) {
    logger.e("imgix filter requires a match array in your _config.yml, e.g.:");
    logger.e("imgix:");
    logger.e("  match:");
    logger.e("    - url: /example/path");
    return noOp;
  }

  return function (data) {

    let hasMatch = false;

    for (const mm of config.match) {
      const re = new RegExp(mm.url, "i");
      if (re.test(data.content)) {
        hasMatch = true;
        break;
      }
    }

    if (hasMatch) {
      data.content = updateTags(data.content, config.match, ctx);
    }
  };
};
