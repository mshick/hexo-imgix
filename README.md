# hexo-tag-imgix
Support for imgix url substitution via a handy tag. Works in templates too.


# _config.yml

> Minimal options

```yaml
imgix:
  domain: example.imgix.net
  match: 'https://s3.amazonaws.com/example-bucket'
```

> All options

```yaml
imgix:
  match:
    - url: 'https://s3.amazonaws.com/example-bucket'
      profile: inline
    - url: '/assets/uploads'
  profiles:
    DEFAULT:
      secure_url: false
      domain: example.imgix.net
      srcset:
        scale: [ 0.5, 0.75, 1.00 ]
        sizes: 100vw
      params:
        w: 600
    inline:
      srcset:
        scale: [ 0.5, 0.75, 1.00 ]
        sizes: (min-width: 36em) 33.3vw, 100vw
      params:
        w: 800
  filter: true
  tag: true
  helper: true
```

> Descriptions

* match: Array of match objects to test for domain substitution, applied to urls / paths provided to the tag. Providing a profile will apply that profile when the match is made.
* profiles: Array of profile objects, valid properties are:
  * secure_url: Whether this domain supports SSL
  * domain: Your imgix domain, is the substitution string for matching urls
  * srcset: If set, will create a scaled srcset value on your output img tag
  * params: imgix API parameters to apply for this profile
* filter: Enables the post filter, which can upgrade image markup after rendering. Also makes use of size parameters for constructing smarter srcsets.
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


# Suggestions

When using the filter processor I like to use `hexo-markdown-it`, along with the `markdown-it-imsize` plugin / module to specify image dimensions in my markdown, and generate source-size-aware imgix tags.


# Resources

* [imgix api](https://www.imgix.com/docs/reference)
