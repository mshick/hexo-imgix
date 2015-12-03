"use strict";

const helper = require("./helper");

const toObject = function (str) {
  const obj = {};
  str.split(",").forEach((param) => {
    const parts = param.split("=");
    obj[parts[0]] = parts[1];
  });
  return obj;
};

module.exports = function (config) {

  config = config || {};

  return function (args) {

    const imageUrl = args[0];
    const params = args[1] ? toObject(args[1]) : {};
    const options = {
      classes: args[2] ? args[2].split(",") : [],
      attrs: args[3] ? toObject(args[3]) : {},
      config
    };

    return helper(config)(imageUrl, params, options);
  };
};
