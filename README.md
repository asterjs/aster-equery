# aster-equery
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

> Replace nodes with pattern-matching selectors in aster.

Allows to use pattern-matching (JavaScript code examples with wildcards and some other special syntax) for finding nodes and replacing them with results of corresponding handlers.

Uses [grasp-equery](https://npmjs.org/package/grasp-equery) behind the scenes, so check out [official documentation](http://graspjs.com/docs/equery/) for syntax details.

## Usage

First, install `aster-equery` as a development dependency:

```shell
npm install --save-dev aster-equery
```

Then, add it to your build script:

```javascript
var aster = require('aster');
var equery = require('aster-equery');

aster.src('src/**/*.js')
.map(equery({
  'if ($cond) return $expr1; else return $expr2;': function (node, named) {
    return {
      type: 'ReturnStatement',
      argument: {
        type: 'ConditionalExpression',
        test: named.cond,
        consequent: named.expr1,
        alternate: named.expr2
      }
    };
  }
  // , ...
}))
.map(aster.dest('dist'))
.subscribe(aster.runner);
```

can be also written as:

```javascript
var aster = require('aster');
var equery = require('aster-equery');

aster.src('src/**/*.js')
.map(equery({
  'if ($cond) return $expr1; else return $expr2;': 'return <%= cond %> ? <%= expr1 %> : <%= expr2 %>'
  // , ...
}))
.map(aster.dest('dist'))
.subscribe(aster.runner);
```

## API

### equery(mappings)

#### mappings
Type: `{pattern: handler}`

Replacement mappings.

##### pattern
Type: `String`

[JavaScript example pattern](http://graspjs.com/docs/equery/).

##### handler (option 1: callback)
Type: `Function(node, named)`

Callback to be called on each found match. It will get two arguments - matched node object and hashmap of named subpatterns.

##### handler (option 2: template)
Type: `String`

[estemplate](https://github.com/RReverser/estemplate) string to be used for generating AST.

#### queryMapper

Custom `queryMapper` RxJS mapper or function that produces such a mapper (when passed `options`).

#### replaces

Custom `replaces` ie. `Rx.Observable.fromArray(...)` or a function that produces it.

#### equery

Custom `equery`, by default `require('grasp-equery')`

#### traverse

Custom `traverse` replacer, by default `require('estraverse').replace`

#### estemplate

Custom `estemplate`, by default `require('estemplate')`

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/aster-equery
[npm-image]: https://badge.fury.io/js/aster-equery.png

[travis-url]: http://travis-ci.org/asterjs/aster-equery
[travis-image]: https://secure.travis-ci.org/asterjs/aster-equery.png?branch=master
