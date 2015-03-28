// # module: cli
//
// Command line app for Dollphie

var doc = [
  'Dollphie — A structured document language.',
  '',
  'Usage:',
  '  dollphie [options] <file>',
  '  dollphie --version',
  '  dollphie --help',
  '',
  'Options:',
  '  -a, --ast                  Displays the AST instead of interpreting',
  '  -h, --help                 Displays this screen',
  '  -v, --version              Displays the version number',
  '',
  '#Transformations:',
  '  --formatter=<TEXT>         The format used for the text (see --list-formatters)',
  '  --json                     Serialises the output to JSON',
  '',
  '#Specific help topics:',
  '  --list-formatters          Lists available text formatters'
].join('\n');


// -- Dependencies -----------------------------------------------------
var docopt = require('docopt').docopt;
var inspect = require('core.inspect');
var pkg = require('../package.json');
var { parse, prelude, evaluate } = require('./language/');
var formatters = require('./post-processing/text');
var fs = require('fs');


// -- Helpers ----------------------------------------------------------
var log     = console.log.bind(console)
var maybeFn = λ f a -> a == null? null : f(a);
var show    = maybeFn(inspectComplex ->> log);
var json    = maybeFn(λ[JSON.stringify(#, null, 2)]);
var read    = λ[fs.readFileSync(#, 'utf-8')];
var ast     = read ->> parse;
var run     = ast ->> evaluate(prelude());

function inspectComplex {
  a @ String => a,
  any        => inspect(any)
}

function listFormatters() {
  return Object.keys(formatters).map(function(formatter) {
    return '- ' + formatter + '\n    ' + formatters[formatter].description
  }).join('\n')
}

function selectFormatter(key) {
  if (!(key in formatters)) {
    throw new ReferenceError("Unknown formatter: " + key);
  }
  return formatters[key].transformation
}

var transformations = [
  ['--formatter', selectFormatter],
  ['--json', λ[json]]
]

function transformationsFor(args) {
  return transformations.map(function(t) {
    return args[t[0]]?      t[1](args[t[0]])
    :      /* otherwise */  null
  }).filter(Boolean)
    .reduce(λ[# ->> #], function(a){ return a })
}

// -- Main -------------------------------------------------------------
module.exports = function Main() {
  var args = docopt(doc.replace(/^#[^\r\n]*/gm, ''), { help: false });

  ; args['--help']?             log(doc.replace(/^#/gm, ''))
  : args['--version']?          log('Dollphie version ' + pkg.version)
  : args['--list-formatters']?  log(listFormatters())
  : args['--ast']?              show(ast(args['<file>']))
  : /* otherwise */             show(transformationsFor(args)(run(args['<file>'])))
}
