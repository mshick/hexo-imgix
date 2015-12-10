"use strict";

const imgix = require("./imgix");

module.exports = function (profiles) {

  return function (imageUrl, options) {

    options = options || {};

    if (!imageUrl) {
      return null;
    }

    const attrs = imgix(imageUrl, profiles, options);

    return attrs.src;
  };
};
