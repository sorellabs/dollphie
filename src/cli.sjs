// # module: cli
//
// Command line app for Dollphie

var doc = [
  'Dollphie — A structured document language.',
  '',
  'Usage:',
  '  dollphie [options] <file>',
  '  dollphie (--list-formatters | --list-input | --list-output)',
  '  dollphie --version',
  '  dollphie --help',
  '',
  'Options:',
  '  -a, --ast                  Displays the AST instead of interpreting',
  '  -h, --help                 Displays this screen',
  '  -v, --version              Displays the version number',
  '',
  '#Transformations:',
  '  --input=<FORMAT>           Convert from the given input format (see --list-input)',
  '  --output=<FORMAT>          The output format for the docs (see --list-output)',
  '  --formatter=<TEXT>         The format used for the text (see --list-formatters)',
  '  --json                     Serialises the output to JSON',
  '',
  '#Specific help topics:',
  '  --list-formatters          Lists available text formatters',
  '  --list-output              Lists available output formats',
  '  --list-input               Lists available input formats'
].join('\n');


// -- Dependencies -----------------------------------------------------
var docopt = require('docopt').docopt;
var inspect = require('core.inspect');
var pkg = require('../package.json');
var { parse, prelude, evaluate } = require('./language/');
var formatters = require('./post-processing/text');
var outputters = require('./output');
var inputters = require('./pre-processing/input-conversion');
var fs = require('fs');


// -- Helpers ----------------------------------------------------------
var log     = console.log.bind(console)
var maybeFn = λ f a -> a == null? null : f(a);
var show    = maybeFn(inspectComplex ->> log);
var json    = maybeFn(λ[JSON.stringify(#, null, 2)]);
var read    = λ[fs.readFileSync(#, 'utf-8')];
var run     = parse ->> evaluate(prelude());

function inspectComplex {
  a @ String => a,
  any        => inspect(any)
}

function list(transforms) {
  return Object.keys(transforms).map(function(transform) {
    return '- ' + transform + '\n    ' + transforms[transform].description
  }).join('\n')
}

function select(desc, what){ return function(key) {
  if (!(key in what)) {
    throw new ReferenceError("Unknown " + desc + ": " + key);
  }
  return what[key].transformation
}}

var postProcessing = [
  ['--formatter', select("formatter", formatters)],
  ['--output', select("output format", outputters)],
  ['--json', λ[json]]
]

var preProcessing = [
  ['--input', select("input format", inputters)]
]

function transformationsFor(transformations, args) {
  return transformations.map(function(t) {
    return args[t[0]]?      t[1](args[t[0]])
    :      /* otherwise */  null
  }).filter(Boolean)
    .reduce(λ[# ->> #], function(a){ return a })
}

// -- Main -------------------------------------------------------------
module.exports = function Main() {
  var args = docopt(doc.replace(/^#[^\r\n]*/gm, ''), { help: false });
  var postProcess = transformationsFor(postProcessing, args);
  var preProcess  = transformationsFor(preProcessing, args);
  var process     = read ->> preProcess ->> run ->> postProcess;
  var ast         = read ->> preProcess ->> parse ->> postProcess;

  ; args['--help']?             log(doc.replace(/^#/gm, ''))
  : args['--version']?          log('Dollphie version ' + pkg.version)

  : args['--list-formatters']?  log(list(formatters))
  : args['--list-output']?      log(list(outputters))
  : args['--list-input']?       log(list(inputters))

  : args['--ast']?              show(ast(args['<file>']))
  : /* otherwise */             show(process(args['<file>']))

}
