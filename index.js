hexo.extend.tag.register("imgix", require("./lib/tag")(hexo));
hexo.extend.helper.register("imgix", require("./lib/helper")(hexo));
