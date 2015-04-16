# descript

Manage desktop scripts in a simple way in Adaptive.js

[![Circle CI](https://circleci.com/gh/mobify/descript.svg?style=shield&circle-token=ef84781d06c021badc882f227815b8e790de3dcb)](https://circleci.com/gh/mobify/descript)

**Descript** allows you to manage scripts captured from the desktop site's HTML from within your Adaptive.js views. It provides some simple features, such as:

1. loading all desktop scripts into a default container, preserving source order
2. allowing the developer to create containers of scripts for different use cases (i.e. urgent scripts that need to be executed in the document head)
3. allowing for unneeded scripts to be removed
4. adding the ability to inject a script to execute at a specific location within a script container.

## Quickstart

Install `descript` using bower:

```cli
bower install descript --save
```

Initialize it in your view:

```js
descript.init();
```

### Preserve scripts in the DOM

If you need to preserve scripts in the DOM in a certain position (i.e. you want descript to leave certain scripts alone), you can specify a `preserve` option when initializing:

```js
descript.init({
	preserve: {
		src: 'leaveThisScript.js',
		contains: ['leave', 'these', 'too']
	}
});
```

The `init` method creates a singleton instance, so subsequent calls will simply return the same instance. This is particularly useful if you need to manipulate scripts in a specific view in addition to the base view.

### Add to containers

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

### Removing scripts

You can also remove scripts entirely:

```js
descript.remove({
  src: ['jquery']
});
```

### Getting scripts

To get scripts within a specific container, use the `get` function, which returns a wrapped set of scripts:

```js
var $urgentScripts = descript.get('urgent');
```

or you can get all the scripts:

```js
var $allScripts = descript.getAll();
```

which will return an object of key/value pairs containing the containers, by name, and the wrapped set of scripts for each container.

### Inserting scripts at a specific location

If you need to insert a script at a specific location, to proxy or override a function for example, you can do this using the `insertScript` function. The second parameter to `insertScript` can be either a `string` representing the `src` attribute of an external script, or a `function` representing the contents of an inline script.

```js
// inserts an external script
descript.insertScript({src: 'script4.js'}, 'someExternal.js');
```

or

```js
// inserts an inline script
descript.insertScript({src: 'script4.js'}, function() {
  // do some overrides in here
);
```

This will inject an inline script immediately after the script defined in the script attribute. So, in the above case, the function passed in will be injected immediately following the script that has a `src` attribute containing `script4.js`.

### Testing for the existence of scripts

At times it may be necessary to test for the existence of certain scripts. To do this you can use the `exists` function.

```js
if (!descript.exists({src: 'someScript'})) {
	descript.insertScript({src: 'script1'}, 'someScript.js');
}
```

## Search Type Structure

Search types are supplied via an **object**, where the key is the **search type** and the value is the **pattern**. The **pattern** can be either a string or regex.

In the example below, we're using the `src` search type, and the pattern is `jquery.ui`.

```js
{ src: 'jquery-ui' }
```

This will match the following:

```html
<script type="text/javascript" x-src="/assets/js/jquery-ui-1.11.4.js"></script>
```

Patterns can be either:

1. A single string or regex pattern, i.e. `'script1'` or `/script1/` or `/script\d/`
2. A string of comma separated patterns, i.e. `'script1, script2'`
3. An array of string or regex patterns, i.e. `['script1', 'script2']` or `[/script1/, /script2/]`

Internally descript will **normalize** these values into an array of patterns.

## Search Types

There are a two different ways to search for scripts. 

### `src`

Specifying the `src` search type will search the script element's `x-src` attribute to see whether it matches the search pattern. If using strings, internally it's using Zepto's contains attribute selector ([x-src*=<pattern>]). If using regex, it matches the pattern.

```js
descript
  .add('urgent', {
    src: ['script1.js', 'script2.js']  
  });
```

### `contains`

Use the `contains` search type if searching for content in an inline script. If using strings, it's using a simple contains using indexOf. If using regex, it matches the pattern.


```js
descript
  .add('urgent', {
    contains: 'somescript.init'  
  });
```

## Using descript in your dust template

Once you've added, removed, and inserted to your heart's content, you will want to output the manipulated scripts in your dust template. To do so, you'll want to retreive all the script containers and attach them to your context.

```js

var descript;

return {
	template: template,
	includes: {
		header: header,
		footer: footer
	},
	preProcess: function() {
		descript = Descript.init();
		
		descript
			.add('seusses', {
				src: ['one-script', 'two-script'],
				contains: ['red script', 'blue script']
			})
			.remove({ src: 'this-script, that-script' });
	},
	context: {
		scripts: descript.getAll(), // attach to context property
		...
	}
};
```

And ultimately use in your dust template:

```html
{scripts.seusses}
...
{scripts.default}
```

## Methods

### `add`

Adds a script to a custom container.

| Parameter name | Description |
|----------------|-------------|
| **container** | The container to add the script to |
| **searchType** | An object containing one or more search types and one or more script patterns for each type | 

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

### `remove`

Removes a script from the default container.

| Parameter name | Description |
|----------------|-------------|
| **searchType** | An object containing one or more search types and one or more script patterns for each type | 

```js
descript.remove({ src: 'jquery' });
```

### `insertScript`

Inserts a script after the script specified by `searchType`

| Parameter name | Description |
|----------------|-------------|
| **searchType** | An object containing one search type and one script pattern |
| **scriptToInsert** | A string (representing an src attribute path) or a function (representing the contents of an inline script) |

```js
// inserts an external script
descript.insertScript({src: 'script4.js'}, 'someExternal.js');
```

or

```js
// inserts an inline script
descript.insertScript({src: 'script4.js'}, function() {
  // do some overrides in here
);
```

### `replace`

Replaces the contents of an inline script specified by `searchType`

| Parameter name | Description |
|----------------|-------------|
| **searchType** | An object containing one search type and one script pattern |
| **pattern** | A string (representing the pattern to find) or an object (representing a has of pattern/replacement pairs) |
| **replacement** | If pattern is a string, this represents the replacement string |

```js
descript.replace({contains: 'google'}, 'alert', 'console.log');
```

or 


```js
descript.replace({contains: 'google'}, {
	pattern: 'alert', replacement: 'console.log',
	pattern: 'hi', replacement: 'bye'
});
```

### `exists`

Determines the existence of the script specified by `searchType`

| Parameter name | Description |
|----------------|-------------|
| **searchType** | An object containing one search type and one script pattern |

```js
// returns true if the script exists
descript.exists({src: 'script4.js'});
```

### Grunt Tasks

* `grunt` or `grunt build` - builds a distributable release
* `grunt test` - runs the test suite
* `grunt test:browser` - runs a server that allows you to run the test suite in your browser
