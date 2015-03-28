// # module: dollphie
//
// The Dollphie documentation language.

var parser      = require('./parser');
var evaluator   = require('./eval');
var runtime     = require('./runtime');
var { desugar } = require('./transformations');
var { curry }   = require('core.lambda');


exports.parse = parse;
function parse(text) {
  return desugar(parser.SugaredParser.matchAll(text, 'document'));
}

exports.parseCore = parseCore;
function parseCore(text) {
  return parser.CoreParser.matchAll(text, 'document');
}

exports.evaluate = curry(2, evaluate);
function evaluate(env, program) {
  return evaluator.eval(env, program);
}

exports.prelude = prelude;
function prelude() {
  return runtime;
}
