/* eslint max-statements:0 */

"use strict";

const helper = require("./helper");

module.exports = function (ctx) {

  const config = ctx.config.imgix;

  return function (data) {

    const matches = [];

    for (const px of config.match) {
      const pattern = `(!\\[(.*?)\\]\\(((?:https:|http:)?(?://)?${px}/?.+?)\\))`;
      const re = new RegExp(pattern, "gi");
      const match = data.content.match(re);
      if (match) {
        match.forEach((matched) => matches.push({ matched, pattern }));
      }
    }

    if (matches && matches.length) {
      matches.forEach((m) => {

        const matched = m.matched;
        const re = new RegExp(m.pattern, "i");
        const parts = matched.match(re);

        const alt = parts[2];
        const right = parts[3].match(/('.*?'|".*?"|\S+)/g);
        const src = right.shift();

        let size;
        let width;
        let height;
        let title;

        if (right.length) {
          for (const r of right) {
            if (r.charAt(0) === "=") {
              size = r.substr(1).split("x");
              width = parseInt(size[0], 10);
              height = parseInt(size[1], 10);
            } else {
              title = r.substr(1, r.length - 2);
            }
          }
        }

        const params = config.filter.params || {};

        const options = {
          attrs: {
            height,
            width,
            alt,
            title
          }
        };

        const html = helper(ctx)(src, params, options);

        data.content = data.content.replace(matched, html);
      });
    }
  };
};
