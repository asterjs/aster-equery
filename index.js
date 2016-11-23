'use strict';

var Rx = require('rx');
var equery = require('grasp-equery');
var Map = Map || require('es6-map');
var traverse = require('estraverse').replace;
var estemplate = require('estemplate');

function defaultMapper(options) {
	return function (files) {
		return files.flatMap(function (file) {
			return options.replaces
				.flatMap(function (replace) {
					var handler = replace.handler;

					return Rx.Observable.fromArray(options.equery.queryParsed(replace.selector, file.program)).map(function (node) {
						var named = node._named || {};
						delete node._named;
						return [node, handler(node, named)];
					});
				})
				.filter(function (replace) { return replace[1] !== undefined })
				.toArray()
				.map(function (replaces) {
					file.program = options.traverse(file.program, {
						leave: Map.prototype.get.bind(new Map(replaces))
					});

					return file;
				});
		});
	}
}

module.exports = function (options) {
	options = options || {}
	options.equery = options.equery || equery
	options.traverse = options.traverse || traverse
	options.estemplate = options.estemplate || estemplate

	var defaultReplaces = Rx.Observable.fromArray(Object.keys(options)).map(function (selector) {
		var handler = options[selector];

		if (typeof handler === 'string') {
			var canBeExprStmt = handler.slice(-1) === ';';
			var tmpl = options.estemplate.compile(handler, {tolerant: true});

			handler = function (node, named) {
				var ast = tmpl(named);

				if (ast.body.length === 1) {
					ast = ast.body[0];

					if (ast.type === 'ExpressionStatement' && !canBeExprStmt) {
						ast = ast.expression;
					}
				} else {
					ast.type = 'BlockStatement';
				}

				return ast;
			};
		}

		return {
			selector: options.equery.parse(selector),
			handler: handler
		};
	});


	var replaces = options.replaces || defaultReplaces
	replaces  = typeof replaces === 'function' ? replaces(options) : replaces
	options.replaces = replaces

	var qMapper = options.queryMapper || defaultMapper
	qMapper = typeof qMapper === 'function' ? qMapper(options) : qMapper
	return qMapper
};
