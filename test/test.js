/* global describe, it */

'use strict';

var assert = require('chai').assert,
	Rx = require('rx'),
	equery = require('..'),
	parse = require('esprima').parse,
	generate = require('escodegen').generate;

it('function handler', function (done) {
	var input = [{
			type: 'File',
			program: parse('function isEven(x) {\n    if ((x & 1) === 0)\n        return \'yes\';\n    else\n        return \'no\';\n}'),
			loc: {
				source: 'file.js'
			}
		}],
		expected = ['function isEven(x) {\n    return (x & 1) === 0 ? \'yes\' : \'no\';\n}'];

	// simulating file sequence and applying transformation
	equery({
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
	})(Rx.Observable.fromArray(input))
	.pluck('program')
	.map(generate)
	// .zip(expected, assert.equal)
	.do(function (file) {
		assert.equal(file, expected[0]);
		// assert.equal(file.program.type, 'Program');
	})

	.subscribe(function () {}, done, done);
});

it('template handler', function (done) {
	var input = [{
			type: 'File',
			program: parse('function isEven(x) {\n    if ((x & 1) === 0)\n        return \'yes\';\n    else\n        return \'no\';\n}'),
			loc: {
				source: 'file.js'
			}
		}],
		expected = ['function isEven(x) {\n    return (x & 1) === 0 ? \'yes\' : \'no\';\n}'];

	// simulating file sequence and applying transformation
	equery({
		'if ($cond) return $expr1; else return $expr2;': 'return <%= cond %> ? <%= expr1 %> : <%= expr2 %>;'
	})(Rx.Observable.fromArray(input))
	.pluck('program')
	.map(generate)
	// .zip(expected, assert.equal)
	.do(function (file) {
		assert.equal(file, expected[0]);
		// assert.equal(file.program.type, 'Program');
	})

	.subscribe(function () {}, done, done);
});
