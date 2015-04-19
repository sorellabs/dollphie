// # module: runtime
//
// Provides the base runtime.

// -- Dependencies -----------------------------------------------------
var c     = require('core.check');
var show  = require('core.inspect');
var Maybe = require('data.maybe');
var equal = require('deep-equal');
var { curry }       = require('core.lambda');
var { Base }        = require('boo');
var { List, Value } = require('./data');
var { eval }        = require('./eval');

var { Applicative, Symbol, Lambda, Tagged, Section, Declaration } = Value;


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

// ### function: raise
// @private
// @type: Error -> Void :: throws
function raise(e) {
  throw e;
}

// ### function: unbox
// @private
// @type: String -> Tagged -> Any :: throws
unbox = curry(2, unbox);
function unbox(tag, val) {
  assert(tag(val));
  return val
}

var str = unbox(c.String);
var num = unbox(c.Number);
var bool = unbox(c.Boolean);

function meta(key, value) {
  return Tagged(Symbol('meta'), { key: key, value: value })
}


// -- Core environment -------------------------------------------------
var Env = module.exports = Base.derive({
  // -- Core operations ------------------------------------------------
  tag:
  Applicative(['tag', 'value'], function(data) {
    return Tagged(data.tag, data.value)
  }),

  meta:
  Applicative(['key', 'value'], function(data) {
    return meta(data.key, data.value)
  }),

  // --- Boolean operations --------------------------------------------
  not:
  Applicative(['value'], function(data) {
    return match data.value {
      false => true,
      []    => true,
      *     => false
    }
  }),

  'boolean?':
  Applicative(['value'], function(data) {
    return data.value === true || data.value === false
  }),

  // --- Numeric operations --------------------------------------------
  '+':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) + num(data.right)
  }),

  '-':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) + num(data.right)
  }),

  '*':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) * num(data.right)
  }),

  '/':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) / num(data.right)
  }),

  // --- Comparison operations -----------------------------------------
  '=':
  Applicative(['left', 'right'], function(data) {
    return equal(data.left, data.right)
  }),
  
  '<':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) < num(data.right)
  }),

  '<=':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) <= num(data.right)
  }),

  '>':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) > num(data.right)
  }),

  '>=':
  Applicative(['left', 'right'], function(data) {
    return num(data.left) >= num(data.right)
  }),

  
  // --- Symbol operations ---------------------------------------------
  name:
  Applicative(['value'], function(data) {
    return match data.value {
      Symbol(a) => a,
      a         => raise(new TypeError('Not a symbol: ' + show(a)))
    }
  }),

  
  // -- Vector operations ----------------------------------------------
  first:
  Applicative(['value'], function(data) {
    assert(c.Array(data.value));
    return data.value.length > 0?  data.value[0]
    :      /* otherwise */         []
  }),

  last:
  Applicative(['value'], function(data) {
    assert(c.Array(data.value));
    return data.value.length > 0?  data.value[data.value.length - 1]
    :      /* otherwise */         []
  }),

  nth:
  Applicative(['value', 'index'], function(data) {
    assert(c.Array(data.value));
    var i = num(data.index);
    if (i > data.value.length - 1) {
      throw new RangeError('Index out of bounds: ' + i);
    } else {
      return data.value[i]
    }
  }),

  // -- Text -----------------------------------------------------------
  paragraph:
  Applicative(['value'], function(data) {
    return Tagged(Symbol('paragraph'), data.value)
  }),

  text:
  Applicative(['value'], function(data) {
    return Tagged(Symbol('text'), data.value)
  }),

  bold:
  Applicative(['value'], function(data) {
    return Tagged(Symbol('bold'), data.value)
  }),

  italic:
  Applicative(['value'], function(data) {
    return Tagged(Symbol('italic'), data.value)
  }),

  'soft-break':
  Applicative(['value'], function(data) {
    return Tagged(Symbol('soft-break'), data.value)
  }),

  line:
  Applicative(['value'], function(data) {
    return Tagged(Symbol('line'), data.value)
  }),
  
  declaration:
  Applicative(['kind', 'name', 'children'], function(data) {
    c.assert(c.String(data.kind));
    c.assert(c.ArrayOf(c.String)(data.name));
    c.assert(c.Array(data.children));
    
    return Tagged(Symbol('declaration'),
                  { kind: data.kind,
                    name: data.name,
                    meta: {},
                    children: data.children })
  }),

  section:
  Applicative(['title', 'children'], function(data) {
    c.assert(c.String(data.title));
    c.assert(c.Array(data.children));
    
    return Tagged(Symbol('section'),
                  { title: data.title,
                    meta: {},
                    children: data.children })
  }),

  code:
  Applicative(['language', 'block'], function(data) {
    c.assert(c.String(data.block));
    
    return Tagged(Symbol('code'),
                  { language: data.language,
                    code: data.block })
  }),

  'private':
  Applicative([], function(){
    return meta('private', true)
  }),

  'public':
  Applicative([], function() {
    return meta('public', true)
  }),

  type:
  Applicative(['block'], function(data) {
    c.assert(c.String(data.block));
    
    return meta('type', data.block)
  }),

  stability:
  Applicative(['block'], function(data) {
    var v = data.block.toLowerCase();
    var allowed = c.Or([
      c.Value('deprecated'),
      c.Value('experimental'),
      c.Value('unstable'),
      c.Value('stable'),
      c.Value('frozen'),
      c.Value('locked')
    ]);
    c.assert(allowed(v));

    return meta('stability', v)
  }),

  portability:
  Applicative(['block'], function(data) {
    c.assert(c.String(data.block));
    
    return meta('portability', data.block)
  })
})

