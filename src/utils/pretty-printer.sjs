// # module: Dollphie.utils.pretty-printer
//
// An implementation of Wadler's Pretty Printer
// (http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)

// -- Dependencies -----------------------------------------------------
var { Base }  = require('adt-simple');
var { curry } = require('core.lambda');

// -- Data structures --------------------------------------------------
// Internal representation of a document
union DOC {
  NIL,
  CONCAT(DOC, DOC),
  NEST(Number, DOC),
  TEXT(String),
  LINE,
  UNION(DOC, DOC)
} deriving (Base)

// Exported representation of a document
union Doc {
  Nil,
  Text(String, Doc),
  Line(Number, Doc)
} deriving (Base)

// -- Helpers ----------------------------------------------------------
// @type: Int, String → String
function repeat(n, s) {
  return Array(n + 1).join(s)
}

// @type: DOC → DOC
function flatten {
  NIL            => NIL,
  CONCAT(a, b)   => CONCAT(flatten(a), flatten(b)),
  NEST(depth, a) => NEST(depth, flatten(a)),
  TEXT(s)        => TEXT(s),
  LINE           => TEXT(""),
  UNION(a, b)    => flatten(a),
  a              => (function(){ throw new Error("No match: " + a) })();
}

// @type: Int, Int, DOC → DOC
function best(width, indentation, doc) {
  return go(width, indentation, [[0, doc]]);

  // @type: Int, Int, (Int, DOC) → Doc
  function go(w, k, x) {
    return match x {
      []                         => Nil,
      [[i, NIL], ...xs]          => go(w, k, xs),
      [[i, CONCAT(x, y)], ...xs] => go(w, k, [[i, x], [i, y]] +++ xs),
      [[i, NEST(j, x)], ...xs]   => go(w, k, [[i + j, x]] +++ xs),
      [[i, TEXT(s)], ...xs]      => Text(s, go(w, k + s.length, xs)),
      [[i, LINE], ...xs]         => Line(i, go(w, i, xs)),
      [[i, UNION(x, y)], ...xs]  => better(w, k, go(w, k, [[i, x]] +++ xs),
                                                 λ[go(w, k, [[i, y]] +++ xs)])
    }
  }

  // @type: Int, Int, Doc, (Unit → Doc) → Doc
  function better(w, k, x, y) {
    return fits(w - k, x)? x : y()
  }

  // @type: Int, Doc → Boolean
  function fits {
    (w, x) if w < 0 => false,
    (w, Nil)        => true,
    (w, Text(s, x)) => fits(w - s.length, x),
    (w, Line(i, x)) => true
  }
}

// @type: DOC, DOC → DOC
function horizontalConcat(x, y) {
  return concat(concat(x, text(" ")), y)
}

// @type: DOC, DOC → DOC
function verticalConcat(x, y) {
  return concat(concat(x, line()), y)
}

// @type: String → Array(String)
function words(s) {
  return s.split(/\s+/)
}

// -- Combinators ------------------------------------------------------
// @type: Unit → DOC
function nil() {
  return NIL
}

// @type: DOC → DOC → DOC
function concat(a, b) {
  return CONCAT(a, b)
}

// @type: Int → DOC → DOC
function nest(depth, a) {
  return NEST(depth, a)
}

// @type: String → DOC
function text(s) {
  return TEXT(s)
}

// @type: Unit → DOC
function line() {
  return LINE
}

// @type: DOC → DOC
function group(a) {
  return UNION(flatten(a), a)
}

// @type: Doc → String
function layout {
  Nil        => "",
  Text(s, a) => s + layout(a),
  Line(i, a) => '\n' + repeat(i, ' ') + layout(a)
}

// @type: Int → DOC → String
function pretty(width, doc) {
  return layout(best(width, 0, doc))
}

// @type: (DOC, DOC → DOC) → Array(DOC) → DOC
function foldDoc {
  (f, [])         => nil(),
  (f, [x])        => x,
  (f, [x, ...xs]) => f(x, foldDoc(f, xs))
}

// @type: Array(DOC) → DOC
function spread(xs) {
  return foldDoc(horizontalConcat, xs)
}

// @type: Array(DOC) → DOC
function stack(xs) {
  return foldDoc(verticalConcat, xs)
}

// @type: Int → DOC → DOC → DOC → DOC
function bracket(indent, left, x, right) {
  return group(
    spread(
      text(l),
      nest(indent, concat(line(), x)),
      line(),
      text(r)
    )
  )
}

// @type: DOC → DOC → DOC
function join(x, y) {
  return concat(concat(x, UNION(text(" "), line())), y)
}

// @type: Array(DOC) → DOC
function fillWords(s) {
  return foldDoc(join, words(s).map(text))
}

// @type: Array(DOC) → DOC
function fill {
  []            => nil(),
  [x]           => x,
  [x, y, ...zs] => UNION(horizontalConcat(flatten(x), fill([flatten(y)] +++ zs)),
                         verticalConcat(x, fill([y] +++ zs)))
}


// -- Exports ----------------------------------------------------------
module.exports = {
  nil       : nil,
  concat    : curry(2, concat),
  nest      : curry(2, nest),
  text      : text,
  line      : line,
  group     : group,
  pretty    : curry(2, pretty),
  foldDoc   : curry(2, foldDoc),
  spread    : spread,
  stack     : stack,
  bracket   : curry(4, bracket),
  join      : curry(2, join),
  fillWords : fillWords,
  fill      : fill
}
