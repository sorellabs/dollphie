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
  '  -v, --version              Displays the version number'
].join('\n');


// -- Dependencies -----------------------------------------------------
var docopt = require('docopt').docopt;
var inspect = require('core.inspect');
var pkg = require('../package.json');
var { parse, prelude, evaluate } = require('./');
var fs = require('fs');


// -- Helpers ----------------------------------------------------------
var show = λ(a) -> a == null? null : console.log(inspect(a));
var read = λ[fs.readFileSync(#, 'utf-8')];
var ast  = read ->> parse;
var run  = ast ->> evaluate(prelude());


// -- Main -------------------------------------------------------------
module.exports = function Main() {
  var args = docopt(doc, { help: false });

  ; args['--help']?     show(doc)
  : args['--version']?  show('Dollphie version ' + pkg.version)
  : args['--ast']?      show(ast(args['<file>']))
  : /* otherwise */     show(run(args['<file>']))
}
