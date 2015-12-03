hexo.extend.tag.register("imgix", require("./lib/tag")(hexo.config.imgix));
hexo.extend.helper.register("imgix", require("./lib/helper")(hexo.config.imgix));
