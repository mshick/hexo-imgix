/* eslint max-len:0 */

/**
 * imgix image tag
 *
 * api: https://www.imgix.com/docs/reference
 *
 * Syntax:
 * {% imgix https://s3.amazonaws.com/example-bucket/example.jpg [key=value,key=value] [class1,class2,classN] [attr=value,attr=value] %}
 */

hexo.extend.tag.register("imgix", require("./lib/tag")(hexo.config.imgix));
hexo.extend.helper.register("imgix", require("./lib/helper")(hexo.config.imgix));
