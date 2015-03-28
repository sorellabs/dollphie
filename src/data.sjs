// # module: data
//
// Provides common types for the runtime.

// -- Dependencies -----------------------------------------------------
var { Base, Cata } = require('adt-simple');


// -- Helpers ----------------------------------------------------------

// ### function: isEnvironment
// @private
// @type: Any → Boolean
function isEnvironment(a) {
  return a && typeof a.derive === 'function'
}


// -- ADTs -------------------------------------------------------------

union List {
  Nil,
  Cons(Value, List)
} deriving (Base, Cata)
exports.List = List;

union Value {
  Symbol(String),
  Applicative(Array, Function),
  Lambda(isEnvironment, Array, Array),
  Tagged(Symbol, *)
} deriving (Base, Cata)
exports.Value = Value;
