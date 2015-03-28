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
  '  --json                     Serialises the output to JSON',
  '  -h, --help                 Displays this screen',
  '  -v, --version              Displays the version number'
].join('\n');


// -- Dependencies -----------------------------------------------------
var docopt = require('docopt').docopt;
var inspect = require('core.inspect');
var pkg = require('../package.json');
var { parse, prelude, evaluate } = require('./language/');
var fs = require('fs');


// -- Helpers ----------------------------------------------------------
var log     = console.log.bind(console)
var maybeFn = λ f a -> a == null? null : f(a);
var show    = maybeFn(inspect ->> log);
var json    = maybeFn(λ[JSON.stringify(#, null, 2)] ->> log);
var read    = λ[fs.readFileSync(#, 'utf-8')];
var ast     = read ->> parse;
var run     = ast ->> evaluate(prelude());


// -- Main -------------------------------------------------------------
module.exports = function Main() {
  var args = docopt(doc, { help: false });

  ; args['--help']?     log(doc)
  : args['--version']?  log('Dollphie version ' + pkg.version)
  : args['--ast']?      show(ast(args['<file>']))
  : args['--json']?     json(run(args['<file>']))
  : /* otherwise */     show(run(args['<file>']))
}
