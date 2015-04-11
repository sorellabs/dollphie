// # module: Dollphie.output.markdown
//
// Outputs documentation as Markdown.

// -- Dependencies -----------------------------------------------------
var extend  = require('xtend');
var { curry } = require('core.lambda');
var { unary } = require('core.arity');
var { Value: { Symbol, Applicative, Lambda, Tagged }} = require('../language/data');
var preProcess = require('../post-processing/text/markdown').transformation;
var pp = require('../utils/pretty-printer');

// -- Helpers ----------------------------------------------------------
function repeat(n, s) {
  return Array(n + 1).join(s)
}

function sanitise(s) {
  return s.replace(/([\*_`\-#])/g, '\\$1')
}
// @type: Int, String, [Expr] → PrettyPrinter.DOC
function section(depth, heading, children) {
  return pp.stack([
    pp.concat(
      pp.spread([pp.text(repeat(depth, '#')), pp.text(heading)]),
      pp.line()
    )
  ] +++ children.map(unary(generate(depth + 1))))
}

// -- Implementation ---------------------------------------------------
generate = curry(2, generate);
function generate(depth, ast) {
  return match ast {
    Tagged(Symbol('paragraph'), xs) =>
      pp.spread([
        pp.fill(xs.map(unary(generate(depth)))),
        pp.line()
      ]),
  
    Tagged(Symbol('text'), xs) =>
      pp.spread(xs.map(unary(generate(depth)))),
  
    Tagged(Symbol('soft-break'), xs) =>
      pp.fill(xs.map(unary(generate(depth)))),
  
    Tagged(Symbol('line'), xs) =>
      pp.concat(pp.line(),
                pp.spread(xs.map(unary(generate(depth))))),
  
    Tagged(Symbol('declaration'), x) =>
      section(depth,
              x.kind + ': `' + sanitise(x.name.join('.')) + '`',
              x.children),

    Tagged(Symbol('section'), x) =>
      section(depth, x.title, x.children),

    Tagged(Symbol('code'), x) =>
      pp.stack([
        pp.concat(pp.line(), pp.text('```' + x.language)),
      ] +++ x.code.split(/\r\n|\r|\n/).map(pp.text) +++ [
        pp.concat(pp.text('```'), pp.line())
      ]),
  
    xs @ Array => pp.stack(xs.map(unary(generate(depth)))),
    node => pp.text(node.toString())
  }
}


// -- Exports ----------------------------------------------------------
module.exports = {
  description: "Outputs documentation as Markdown.",
  transformation: preProcess ->> generate(1) ->> pp.pretty(80)
}
