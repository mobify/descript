# descript

Manage desktop scripts in a simple way in Adaptive.js

[![Circle CI](https://circleci.com/gh/mobify/descript.svg?style=shield&circle-token=ef84781d06c021badc882f227815b8e790de3dcb)](https://circleci.com/gh/mobify/descript)

Descript allows you to manage scripts captured from desktop from within your Adaptive.js views. It provides some simple features:

1. Loading all desktop scripts into a default container, preserving source order
2. Allowing the developer to create containers of scripts for different use cases (i.e. urgent scripts that need to be executed in the document head)
3. Allowing for unneeded scripts to be removed
4. Adding the ability to inject a script to execute at a specific location within a script container

## Quickstart

Install descript using bower:

```cli
bower install descript --save
```

Initialize it in your view:

```js
descript.init();
```

The init method creates a singleton instance, so subsequent calls will simply return the same instance. This is particularly useful if you need to manipulate scripts in a specific view in addition to the base view.

After initializing you can then use descript to add scripts to different containers, using patterns that match either `src` attributes (or `x-src` in the case of a captured document) for external scripts, or string patterns for inline scripts:

```js
descript
  .add('urgent', {
    src: ['script1.js', 'script2.js'],
    contains: 'somescript.init'
  })
  .add('defer', {
    src: ['script4.js']
  });
```

Or, you can remove scripts entirely:

```js
descript.remove({
  src: ['jquery']
});
```

To get scripts within a specific container, use the `get` function:

```js
var $urgentScripts = descript.get('urgent');
```

or you can get all the scripts:

```js
var $allScripts = descript.getAll();
```

which will return an object of key/value pairs containing the containers, by name, and the wrapped set of scripts for each container.

If you need to inject a script at a specific location, to proxy or override a function for example, you can do this using the `injectScript` function.

```js
descript.injectScript({src: ['script4.js']}, function() {
  // do some overrides in here
);
```

This will inject an inline script immediately after the script defined in the script attribute. So, in the above case, the function passed in will be injected immediately following the script that has a `src` attribute containing `script4.js`.

## Search Type Structure

Search types are supplied via an **object**, where the key is the **search type** and the value is the **pattern**. 

In the example below, we're using the `src` search type, and the pattern is `jquery.ui`.

```js
{ src: 'jquery.ui' }
```

This will match the following:

```html
<script type="text/javascript" x-src="/assets/js/jquery-ui-1.11.4.js"></script>
```

Patterns can be either:

1. A single string pattern, i.e. 'script1'
2. A string of comma separated patterns, i.e. 'script1, script2'
3. An array of patterns, i.e. ['script1', 'script2']

Internally descript will **normalize** these values into an array of patterns.

## Search Types

There are a few different ways to search for scripts. 

### `src`

Specifying the `src` search type will search the script element's `x-src` attribute to see whether it **contains** the search pattern.

### `regex`

If you need more control over the pattern you're searching for, use the regex search type. This search type will also search `x-src` attributes, but will allow for more specific search patterns. 

### `contains`

Use the `contains` search type if searching for content in an inline script. 

