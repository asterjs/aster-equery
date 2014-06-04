'use strict';

var Rx = require('rx');
var equery = require('grasp-equery');
var Map = require('es6-map');
var traverse = require('estraverse').replace;

module.exports = function (options) {
	var replaces = Rx.Observable.fromArray(Object.keys(options)).map(function (selector) {
		return {
			selector: equery.parse(selector),
			handler: options[selector]
		};
	});

	return function (files) {
		return files.flatMap(function (file) {
			return replaces
				.flatMap(function (replace) {
					var handler = replace.handler;

					return Rx.Observable.fromArray(equery.queryParsed(replace.selector, file.program)).map(function (node) {
						var named = node._named;
						delete node._named;
						return [node, handler(node, named)];
					});
				})
				.filter(function (replace) { return replace[1] !== undefined })
				.toArray()
				.map(function (replaces) {
					file.program = traverse(file.program, {
						leave: Map.prototype.get.bind(new Map(replaces))
					});

					return file;
				});
		});
	}
};
