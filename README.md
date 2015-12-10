# hexo-tag-imgix
Support for imgix url substitution via a handy tag. Works in templates too.

# _config.yml

> Minimal options. This will effectively just substitute your internal urls
  for imgix urls, perhaps leveraging it as a CDN, or maybe you're putting the
  imgix query params directly on your image urls?

```yaml
imgix:
  match: https://s3.amazonaws.com/example-bucket
  domain: example.imgix.net
```

> All options. It can do a lot!

```yaml
imgix:
  - 
    name: example
    match: https://s3.amazonaws.com/example-bucket
    domain: example.imgix.net
    secure_url: false
    srcset:
      scale: [ 0.5, 0.75, 1.00 ]
      sizes: 100vw
    params:
      w: 500
      h: 500
      blend: color
    filter: true
    tag: true
    helper: true
  - 
    name: uploads
    match: /assets/uploads
    domain: uploads.imgix.net
    secure_url: true
    srcset:
      scale: [ 0.5, 0.75, 1.00 ]
      sizes: (min-width: 36em) 33.3vw, 100vw
      min: 300
      max: 1000
    params:
      w: 800
    filter: false
    tag: true
    helper: false
```

# Options

> You can provide either a single "profile" object, or an array of profiles.
  Later profiles that define the same `match` will override earlier profiles.

* `match`*: A match string to test for domain substitution, applied to
  urls / paths provided to the tag/helper/filter. When a match is made this
  profile will be applied.
* `domain`*: An imgix domain, will be substituted for the match when the url
  is rebuilt
* `name`: If you provide a name you can reference this profile specifically in
  the helper. Useful if you have multiple profiles for the same match.
* `securl_url`: Whether this domain supports SSL
* `srcset`: If set, will create a scaled srcset on your output img tag
  * `scale`: Scaling values to use, 0.00-1.00
  * `sizes`: pushed straight into your images `sizes` attr
  * `min`: A minimum computed size to allow into your srcset
  * `max`: A maximum computed size to allow into your srcset
* `filter`: Enables the filter for this profile. It can upgrade image markup
  after rendering. Default is enabled.
* `tag`: Enables the tag for this profile. You can use this directly in markdown
  to manipulate images. Default is enabled.
* `helper`: Enables the template helper for this profile, which allows similar
  functionality in templates. Default is enabled.

> `*` denotes a required property

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

```html
<img src="http://example.imgix.net/example.jpg" alt="" />
```

> Sample args all

```md
{% imgix blend:color inline-image https://s3.amazonaws.com/example-bucket/example.jpg 1000 500 "'This is a title'" "'This is alt text'" %}
```

```html
<img src="http://example.imgix.net/example.jpg?w=1000&h=500&blend=color" class="inline-image" alt="This is alt text" title="This is a title" />
```

 > As a template helper, in ejs for example

```ejs
<%- imgix(photo.src, { classes: ["class1", "class2"], attrs: { "height": 500, "width": 1000 }, params: { blend: "color" }, profile: "example" }) %>
<%- imgix_url(photo.src, { attrs: { "height": 500, "width": 1000 }, params: { blend: "color" }, profile: "example" }) %>
```

```html
<img src="http://example.imgix.net/example.jpg?w=1000&h=500&blend=color" class="class1 class2" alt="" />
http://example.imgix.net/example.jpg?w=1000&h=500&blend=color
```

# Suggestions

When using the filter processor I like to use `hexo-markdown-it`, along with
the `markdown-it-imsize` plugin / module to specify image dimensions in my
markdown, and generate source-size-aware imgix tags.

# Resources

* [imgix api](https://www.imgix.com/docs/reference)
