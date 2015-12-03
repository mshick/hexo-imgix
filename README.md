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
  replace:
    - 'https://s3.amazonaws.com/example-bucket'
    - 'assets/uploads'
  profiles:
    DEFAULT: w=600
    inline: w=800
    attachment: w=1000
  srcset:
    scale: [ 0.5, 0.75, 1.00 ]
    min: 300
    max: 2000
```

> Descriptions

* domain: Your imgix domain, is the substitution string for replacement patterns
* replace: Array of replacement patterns, applied to urls / paths provided to the tag
* profiles: Array of query string parameters that adhere to the imgix API
* src_set: If set, will create a scaled srcset value on your output img tag

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

# Resources

* [imgix api](https://www.imgix.com/docs/reference)
