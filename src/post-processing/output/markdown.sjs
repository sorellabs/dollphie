// # module: Dollphie.output.markdown
//
// Outputs documentation as Markdown.

// -- Dependencies -----------------------------------------------------
var extend  = require('xtend');
var { curry } = require('core.lambda');
var { unary } = require('core.arity');
var { Value: { Symbol, Applicative, Lambda, Tagged }} = require('../../language/data');
var preProcess = require('../text/markdown').transformation;
var pp = require('../../utils/pretty-printer');

// -- Helpers ----------------------------------------------------------
function repeat(n, s) {
  return Array(n + 1).join(s)
}

function sanitise(s) {
  return s.replace(/([\*_`\-#])/g, '\\$1')
}

function renderStability(v) {
  return match v {
    'deprecated'     => badge('0. Deprecated', 'red'),
    'experimental'   => badge('1. Experimental', 'orange'),
    'unstable'       => badge('2. Unstable', 'yellow'),
    'stable'         => badge('3. Stable', 'green'),
    'frozen'         => badge('4. Frozen', 'green'),
    'locked'         => badge('5. Locked', 'blue'),
    undefined        => undefined,
    null             => null
  };

  function badge(s, c) {
    return '[![' + s + '](https://img.shields.io/badge/stability-' + sanitise(s) + '-' + c + '.svg?style=flat-square)](https://nodejs.org/api/documentation.html#documentation_stability_index)'
  }

  function sanitise(s) {
    return s.replace(/\s/g, '_')
  }
}

function field(name, value) {
  if (value == null) {
    return pp.nil()
  } else {
    return pp.spread([
      pp.text('- **' + name + '**:'),
      pp.text(String(value))
    ])
  }
}

// @type: String, String → PrettyPrinter.DOC
function code(lang, lines) {
  return pp.stack([
    pp.line() +++ pp.text('```' + lang)
  ] +++ lines.split(/\r\n|\r|\n/).map(pp.text) +++ [
    pp.text('```') +++ pp.line()
  ])
}

function visibility(meta) {
  return [ meta['private']?   'private'   : ''
         , meta['public']?    'public'    : ''
         , meta['protected']? 'protected' : ''
         ].filter(Boolean).map(pp.text)
}

// @type: Int, String, [Expr] → PrettyPrinter.DOC
function section(depth, heading, meta, children) {
  return pp.stack([
    pp.concat(
      pp.spread([pp.text(repeat(depth, '#'))] +++ visibility(meta) +++ [pp.text(heading)]),
      pp.line()
    ),
  ] +++ (meta.type? [code('hs', meta.type)] : []) +++ [
    field('Stability', renderStability(meta.stability)),
    field('Portability', meta.portability),
    pp.line()
  ] +++ children.map(unary(generate(depth + 1))))
}

// -- Implementation ---------------------------------------------------
generate = curry(2, generate);
function generate(depth, ast) {
  return match ast {
    Tagged(Symbol('paragraph'), xs) =>
      pp.spread([
        pp.spread(xs.map(unary(generate(depth)))),
        pp.line()
      ]),
  
    Tagged(Symbol('text'), xs) =>
      pp.foldDoc(pp.concat, xs.map(unary(generate(depth)))),
  
    Tagged(Symbol('soft-break'), xs) =>
      pp.fill(xs.map(unary(generate(depth)))),
  
    Tagged(Symbol('line'), xs) =>
      pp.concat(pp.line(),
                pp.spread(xs.map(unary(generate(depth))))),
  
    Tagged(Symbol('declaration'), x) =>
      section(depth,
              x.kind + ': `' + sanitise(x.name.join('.')) + '`',
              x.meta,
              x.children),

    Tagged(Symbol('section'), x) =>
      section(depth, x.title, {}, x.children),

    Tagged(Symbol('code'), x) => code(x.language, x.code),
    Tagged(Symbol('meta'), *) => pp.nil(),
  
    xs @ Array => pp.stack(xs.map(unary(generate(depth)))),
    node => pp.text(node.toString().replace(/([\*_\-#])/g, '\\$1'))
  }
}


// -- Exports ----------------------------------------------------------
module.exports = {
  description: "Outputs documentation as Markdown.",
  transformation: preProcess ->> generate(1) ->> pp.pretty(80)
}
