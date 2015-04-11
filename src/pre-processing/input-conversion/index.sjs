// # module: Dollphie.pre-processing.input-conversion
//
// Describes ways in which we may convert other sources to Dollphie

// -- Dependencies -----------------------------------------------------
var { curry } = require('core.lambda');
var { unary, binary } = require('core.arity');
var { Base } = require('adt-simple');

// -- Data structures --------------------------------------------------
union LineClassification {
  Doc {
    lineNumber: Number,
    lines: Array/*(String)*/
  },
  Code {
    lineNumber: Number,
    language: String,
    lines: Array/*(String)*/
  }
} deriving (Base)

LineClassification::assimilate = function(y) {
  return match (this, y) {
    (Doc(i, xs), Doc(_, ys))                        => [Doc(i, xs +++ ys)],
    (Code(i, l1, xs), Code(_, l2, ys)) if l1 === l2 => [Code(i, l1, xs +++ ys)],
    (*, *)                                          => [this, y]
  }
}

LineClassification::render = function() {
  return match this {
    Doc(i, xs)     => xs.join('\n'),
    Code(i, l, xs) => '@code(language: ' + JSON.stringify(l)
                                         + ' "' + sanitiseString(xs.join('\n')) + '")'
  }
}

// -- Helpers ----------------------------------------------------------
// @type: String → String
function sanitiseString(s) {
  return s.replace(/"/g, '\\"');
}

// @type: RegExp → String → String → Int → LineClassification
classify = curry(4, classify);
function classify(commentRe, language, line, no) {
  var doc = line.match(commentRe);
  return doc !== null?    Doc(no, [doc[1]])
  :      /* otherwise */  Code(no, language, [line])
}

// @type: Array(LineClassification), LineClassification → Array(LineClassification)
function flattenClassifications(xs, x) {
  var last = xs[xs.length - 1];
  return xs.slice(0, -1) +++ (last? last.assimilate(x) : [x]);
}

// @type: RegExp → String → String → String
lineComment = curry(3, lineComment);
function lineComment(commentRe, language, input) {
  return input.split(/\r\n|\r|\n/)
              .map(binary(classify(commentRe, language)))
              .reduce(flattenClassifications, [])
              .map(λ[#.render()])
              .join('\n')
}


module.exports = {
  javascript: {
    transformation: lineComment(/^\s*\/\/(.*)$/, 'js'),
    description: 'Convert JavaScript files to Dollphie'
  }
}
