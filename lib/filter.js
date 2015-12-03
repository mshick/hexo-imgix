"use strict";

module.exports = function (ctx) {

  return function (data) {
    console.log("FILTER HERE=====================");

    const pattern = "https://s3.amazonaws.com/assets.shoutingoutloud.com";
    const re = new RegExp(`(!\\[(.*?)\\]\\((${pattern}/?.+?)\\))`, "gi");

    const matches = data.content.match(re);

    if (matches) {
      matches.forEach((m) => {
        const re2 = new RegExp(`(!\\[(.*?)\\]\\((${pattern}/?.+?)\\))`, "i");
        const match = m.match(re2);

        const alt = match[2];
        const right = match[3].split(" ");
        const src = right.shift();
        let size;
        if (right.length) {
          for (const r of right) {
            if (r.charAt(0) === "=") {
              size = r.substr(1).split("x").join(" ");
            }
          }
        }

        data.content = data.content.replace(m, `{% imgix profile:inline ${src} ${size} %}`);
      });
    }

    // const re = new RegExp(`(!\[(.*?)\]\((https:\/\/s3\.amazonaws\.com\/assets\.shoutingoutloud\.com\/.+?)\))`)
    // data.content = data.content.replace(/\![]https://s3.amazonaws.com/assets.shoutingoutloud.com", "https://imgix.shoutingoutloud.com");

    // console.log(data._content);
  };
};
