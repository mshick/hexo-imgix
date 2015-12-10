const buildHtmlAttrs = function (attrs, userAttrs) {

  const htmlAttrs = Object.assign({}, userAttrs, attrs);

  // Always set these
  htmlAttrs.src = attrs.src;

  if (attrs.srcset) {
    htmlAttrs.srcset = attrs.srcset;
    htmlAttrs.sizes = attrs.sizes;
  }

  if (htmlAttrs.classes && Array.isArray(htmlAttrs.classes)) {
    htmlAttrs.class = htmlAttrs.classes.join(" ");
    delete htmlAttrs.classes;
  }

  htmlAttrs.alt = htmlAttrs.alt || "";

  return htmlAttrs;
};

module.exports = buildHtmlAttrs;
