"use strict";

const isEmptyObject = function (obj) {
  return Object.keys(obj) === 0;
};

const compactObject = function (obj) {
  if (!(obj instanceof Object)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.filter((x) => compactObject(x));
  }

  const compacted = {};

  for (const prop in obj) {
    // Prevent empty params from persisting

    let val = obj[prop];

    if (val instanceof Object) {
      val = compactObject(val);
    }

    if (val !== null && val !== undefined) {
      compacted[prop] = val;
    }
  }

  if (isEmptyObject(compacted)) {
    return null;
  }

  return compacted;
};

module.exports = compactObject;
