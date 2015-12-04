# hexo-tag-imgix
Support for imgix url substitution via a handy tag. Works in templates too.

# _config.yml

> Minimal options

```yaml
imgix:
  domain: example.imgix.net
  replace:
    - 'https://s3.amazonaws.com/example-bucket'
```

> All options

```yaml
imgix:
  domain: example.imgix.net
  match:
    - 'https://s3.amazonaws.com/example-bucket'
    - assets/uploads
  profiles:
    DEFAULT:
      w: 600
      blend: color
    inline:
      w: 800
    attachment:
      w: 1000
  srcset:
    scale: [ 0.5, 0.75, 1.00 ]
    min: 300
    max: 2000
  filter:
    params:
      profile: inline
  tag: true
  helper: true
```

> Descriptions

* domain: Your imgix domain, is the substitution string for replacement patterns
* match: Array of patterns to match for domain substitution, applied to urls / paths provided to the tag
* profiles: Array of query string parameters that adhere to the imgix API
* srcset: If set, will create a scaled srcset value on your output img tag
* filter: Enables the post filter, which can upgrade standard markdown images during rendering. Also makes use of the `=000x000` size proposal for specifying an images source dimensions.
* tag: Enables the tag. You can use this directly in markdown to manipulate images.
* helper: Enables the template helper, which allows similar functionality in templates.


# Syntax

The syntax is almost identical to the Hexo `img` tag, but accepts colon-separated
parameters in the space before the image url.

```md
{% imgix [class names AND/OR params:values] /path/to/image [width] [height] ['title text' ['alt text']] %}
```

# Usage

> Minimal use in markdown

```md
{% imgix https://s3.amazonaws.com/example-bucket/example.jpg %}
```

> Sample args all

```md
{% imgix profile:inline blend:color inline-image https://s3.amazonaws.com/example-bucket/example.jpg 1000 500 "'This is a title'" "'This is alt text'" %}
```

 > As a template helper, in ejs for example

```ejs
<%- imgix(photo.src, { profile: "inline", blend: "color" }, { classes: ["class1", "class2"], params: { "height": 500, "width": 1000 } }) %>
```

#

# Resources

* [imgix api](https://www.imgix.com/docs/reference)
