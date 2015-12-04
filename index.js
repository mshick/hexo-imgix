const settings = {
  filter: true,
  tag: true,
  helper: true
};

const config = hexo.config.imgix;

Object.assign(settings, config);

if (settings.tag) {
  hexo.extend.tag.register("imgix", require("./lib/tag")(hexo));
}

if (settings.helper) {
  hexo.extend.helper.register("imgix", require("./lib/helper")(hexo));
}

if (settings.filter) {
  hexo.extend.filter.register("before_post_render", require("./lib/filter")(hexo));
}

