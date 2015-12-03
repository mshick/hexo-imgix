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
  src_set: [ 0.5, 0.75, 1.00 ]
```

> Descriptions

* domain: Your imgix domain, is the substitution string for replacement patterns
* replace: Array of replacement patterns, applied to urls / paths provided to the tag
* profiles: Array of query string parameters that adhere to the imgix API
* src_set: If set, will create a scaled srcset value on your output img tag

# Usage

> Minimal use in markdown

```md
{% imgix https://s3.amazonaws.com/example-bucket/example.jpg %}
```

> Sample args all

```md
 {% imgix https://s3.amazonaws.com/example-bucket/example.jpg profile=inline,blend=color inline-image,color data-foo=bar %}
 ```

 > Sample args signature

```md
 {% imgix https://s3.amazonaws.com/example-bucket/example.jpg [param=value,param2=value] [class1,class2,classN] [attr=value,attr=value] %}
 ```

 > As a template helper, in ejs for example

 ```ejs
<%- imgix(photo.src, { profile: "inline", blend: "color" }, ["class1", "class2"], { "data-foo": "bar" }) %>
 ```

# Resources

* [imgix api](https://www.imgix.com/docs/reference)
