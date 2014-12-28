// # module: runtime
//
// Provides the base runtime.

// -- Dependencies -----------------------------------------------------
var c = require('core.check');
var show = require('core.inspect');
var equal = require('deep-equal');
var { Base } = require('boo');
var { List, Value:{ Applicative, Symbol, Lambda, Tagged } } = require('./data');
var { eval } = require('./eval');


// -- Helpers ----------------------------------------------------------

// ### function: describe
// @private
// @type: Violation → String
exports.describe = describe;
function describe {
  c.Violation.Tag(a, b)      => show(b) + ' to be of type ' + a,
  c.Violation.Equality(a, b) => show(b) + ' to equal ' + show(a),
  c.Violation.Identity(a, b) => show(b) + ' to be ' + show(a),
  c.Violation.Any(xs)        => xs.map(describe).join(', or '),
  c.Violation.And(xs)        => xs.map(describe).join(', and ')
}

// ### function: assert
// @private
// @type: Validation[Violation, α] → α :: throws
exports.assert = assert;
function assert(val) {
  val.cata({
    Failure: λ(a) -> { throw new Error('Expected ' + describe(a)) },
    Success: λ[#]
  })
}


// -- Core environment -------------------------------------------------
var Env = Base.derive({

  // --- Boolean operations --------------------------------------------
  not:
  Applicative(['value'], function(data) {
    return data.value === false?     true
    :      data.value === true?      false
    :      data.value === List.Nil?  true
    :      /* otherwise */           false
  }),

  'boolean?':
  Applicative(['value'], function(data) {
    return data.value === false || data.value === true
  }),

  // --- Numeric operations --------------------------------------------
  '+':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left + data.right
  }),

  '-':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left - data.right
  }),

  '*':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left * data.right
  }),

  '/':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left / data.right
  }),

  // --- Comparison operations -----------------------------------------
  '=':
  Applicative(['left', 'right'], function(data) {
    return equal(data.left, data.right)
  }),
  
  '<':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left < data.right
  }),

  '<=':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left <= data.right
  }),

  '>':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left > data.right
  }),

  '>=':
  Applicative(['left', 'right'], function(data) {
    assert(c.Seq([c.Number, c.Number])(data.left, data.right));
    return data.left >= data.right
  }),

  
  // --- Symbol operations ---------------------------------------------
  name:
  Applicative(['value'], function(data) {
    return match data.value {
      Symbol(a) => a
    }
  }),

  
  // -- Vector operations ----------------------------------------------
  first:
  Applicative(['value'], function(data) {
    if (data.value === List.Nil)  return List.Nil;
    
    assert(c.Array(data.value));
    return data.value.length > 0?  data.value[0]
    :      /* otherwise */         List.Nil
  }),

  last:
  Applicative(['value'], function(data) {
    if (data.value === List.Nil)  return List.Nil;
    
    assert(c.Array(data.value));
    return data.value.length > 0?  data.value[data.value.length - 1]
    :      /* otherwise */         List.Nil
  }),

  nth:
  Applicative(['value', 'index'], function(data) {
    if (data.value === List.Nil) {
      throw new RangeError('Index out of bounds: ' + data.index);
    } else {
      assert(c.Array(data.value));
      if (data.index > data.value.length - 1) {
        throw new RangeError('Index out of bounds: ' + data.index);
      } else {
        return data.value[data.index]
      }
    }
  }),

  
  

});

