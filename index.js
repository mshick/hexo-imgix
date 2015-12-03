const config = hexo.config.imgix;

if (config.tag) {
  hexo.extend.tag.register("imgix", require("./lib/tag")(hexo));
}

if (config.helper) {
  hexo.extend.helper.register("imgix", require("./lib/helper")(hexo));
}

if (config.filter) {
  hexo.extend.filter.register("before_post_render", require("./lib/filter")(hexo));
}

