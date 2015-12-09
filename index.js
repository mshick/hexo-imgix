const defaults = {
  filter: true,
  tag: true,
  helper: true
};

const config = hexo.config.imgix;
const settings = Object.assign(defaults, config);

if (settings.tag) {
  hexo.extend.tag.register("imgix", require("./lib/tag")(hexo));
}

if (settings.helper) {
  hexo.extend.helper.register("imgix", require("./lib/helper")(hexo));
}

if (config && settings.filter) {
  hexo.extend.filter.register("after_render", require("./lib/filter")(hexo));
}

