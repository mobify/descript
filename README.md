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

Initialize it in your base view:

```js
descript.init();
```

Then use it to add scripts to different containers, using patterns that match either `src` attributes for external scripts, or string patterns for inline scripts:

```js
descript
  .add('urgent', {
    src: ['script1.js', 'script2.js'],
    contains: ['somescript.init']
  })
  .add('defer', {
    src: ['script4.js']
  });
```

Or, you can remove scripts entirely from the default container:

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
var $allScripts = descript.get();
```

which will return an object of key/value pairs containing the containers, by name, and the wrapped set of scripts for each container.

If you need to inject a script at a specific location within a container, to proxy or override a function for example, you can do this using the `injectScript` function.

```js
descript.injectScript('myOverride', 'urgent', {src: ['script4.js']}, function() {
  // do some overrides in here
);
```
