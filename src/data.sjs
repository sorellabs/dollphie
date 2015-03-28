// # module: data
//
// Provides common types for the runtime.

// -- Dependencies -----------------------------------------------------
var { Base, Cata } = require('adt-simple');
var show = require('core.inspect');


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
  Symbol { value: String },
  Applicative { args: Array, fn: Function },
  Lambda { env: isEnvironment, args: Array, body: Array },
  Tagged { tag: Symbol, value: * }
} deriving (Base, Cata)
exports.Value = Value;


Applicative::toString = function() {
  return 'Applicative(' + show(this.args) + ', ' + this.fn + ')'
}

Lambda::toString = function() {
  return 'Lambda(' + show(this.env) + ', ' + show(this.args) + ', ' + show(this.body) + ')'
}

Tagged::toString = function() {
  return 'Tagged(' + show(this.tag) + ', ' + show(this.value) + ')'
}



Symbol::toJSON = function() {
  return {
    "#type": "Dollphie.Symbol",
    "value": this.value
  }
}

Applicative::toJSON = function() {
  throw new Error("Applicatives aren't serialisable.")
}

Lambda::toJSON = function() {
  throw new Error("Lambdas aren't serialisable.")
}

Tagged::toJSON = function() {
  return {
    "#type": "Dollphie.Tagged",
    "tag": this.tag.value, // No need to keep the symbol wrapper here
    "value": this.value
  }
}

