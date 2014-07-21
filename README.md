# upt-json 

Read `upt.json` files with semantics, normalisation, defaults and validation.


## Usage

#### .read(file, options, callback)

Reads `file` and applies normalisation, defaults and validation according to the `upt.json` spec.   
If the passed `file` does not exist, the callback is called with `error.code` equal to `ENOENT`.   
If the passed `file` contents are not valid JSON, the callback is called with `error.code` equal to `EMALFORMED`.   
If the `json` does not comply with the `upt.json` spec, the callback is called with `error.code` equal to `EINVALID`.

If `file` is a directory, `find()` will be used to search for the json file.   
The `options` argument is optional and can be omitted. These options will be passed to `parse` method.


```js
var uptJson = require('upt-json');

// Can also be used by simply calling uptJson()
uptJson.read('/path/to/upt.json', function (err, json) {
    if (err) {
        console.error('There was an error reading the file');
        console.error(err.message);
        return;
    }

    console.log('JSON: ', json);
});
```


#### .parse(json, options)

Parses an object. Useful when you want to apply normalisation and validation directly to an object.   
If the `json` does not comply with the `upt.json` spec, an error is thrown with `error.code` equal to `EINVALID`.

The `options` arguments is optional and can be omitted. Available options:

- validate: Apply validation, defaults to `true`
- normalize: Apply normalisation, defaults to `false`
- clone: clone, use and return the passed in `json` object instead of using it directly, defaults to `false`


```js
var uptJson = require('upt-json');

var json = {
    name: 'my-package',
    version: '0.0.1'
};

try {
    uptJson.parse(json);
} catch (err) {
    console.error('There was an error parsing the object');
    console.error(err.message);
}
```


#### .validate(json)

Validates the passed `json` object.   
Throws an error with `error.code` equal to `EINVALID` if it does not comply with the spec.


```js
var uptJson = require('upt-json');

var json = {
    name: 'my-package',
    version: '0.0.1'
};

try {
    uptJson.validate(json);
} catch (err) {
    console.error('There was an error validating the object');
    console.error(err.message);
}
```


#### .normalize(json)

```js
var uptJson = require('upt-json');

var json = {
    name: 'my-package',
    version: '0.0.1',
    main: 'foo.js,bar.js'
};

uptJson.nornalize(json);
json.main // ['foo.js', 'bar.js']
```


#### .find(folder, callback)

Finds the `json` filename inside a folder.   
Checks if a `upt.json` exists, falling back to `component.json` (deprecated) and `.upt.json`.   
If no file was found, the callback is called with a `error.code` of `ENOENT`.

```js
var uptJson = require('upt-json');

uptJson.find('/path/to/folder', function (err, filename) {
    if (err) {
        console.error('There is no json file in the folder');
        return;
    }

    console.log('Filename: ', filename);

    // Now that we got the filename, we can read its contents
    uptJson.read(filename, function (err, json) {
        if (err) {
            console.error('There was an error reading the file');
            console.error(err.message);
            return;
        }

        console.log('JSON: ', json);
    });
});
```

