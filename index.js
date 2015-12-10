const defaults = {
  filter: true,
  tag: true,
  helper: true
};

const findProfiles = function (pluginName, profiles) {
  return profiles
    .filter((x) => Object.keys(x).length)
    .map((x) => Object.assign({}, defaults, x))
    .filter((x) => x[pluginName]);
};

const config = hexo.config.imgix || {};

const allProfiles = Array.isArray(config) ? config : [config];

const tagProfiles = findProfiles("tag", allProfiles);

if (tagProfiles.length) {
  hexo.extend.tag.register("imgix", require("./lib/tag")(tagProfiles, hexo));
}

const helperProfiles = findProfiles("helper", allProfiles);

if (helperProfiles.length) {
  hexo.extend.helper.register("imgix", require("./lib/helper")(helperProfiles, hexo));
  hexo.extend.helper.register("imgix_url", require("./lib/helper-url")(helperProfiles, hexo));
}

const filterProfiles = findProfiles("filter", allProfiles);

if (filterProfiles.length) {
  hexo.extend.filter.register("after_post_render", require("./lib/filter")(filterProfiles, hexo));
}

