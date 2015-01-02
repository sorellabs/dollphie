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

// ### function: assert
// @private
// @type: Validation[Violation, α] → α :: throws
function assert(val) {
  val.cata({
    Failure: λ(a) -> { throw new Error('Expected ' + show(a)) },
    Success: λ[#]
  })
}


// -- Core environment -------------------------------------------------
var Env = module.exports = Base.derive({

  // --- Boolean operations --------------------------------------------
  not:
  Applicative(['value'], function(data) {
    return data.value === false?     Tagged('boolean', true)
    :      data.value === true?      Tagged('boolean', false)
    :      data.value === List.Nil?  Tagged('boolean', true)
    :      /* otherwise */           Tagged('boolean', false)
  }),

  'boolean?':
  Applicative(['value'], function(data) {
    return Tagged('boolean', data.value === false || data.value === true)
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

  paragraph:
  Applicative(['value'], function(data) {
    return data.value
  }),

  text:
  Applicative(['value'], function(data) {
    return data.value
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

