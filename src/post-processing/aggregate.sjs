// # module: Dollphie.post-processing.aggregate
//
// Aggregates meta-data.

// -- Dependencies -----------------------------------------------------
var extend = require('xtend');
var Maybe = require('data.maybe');
var show = require('core.inspect');
var { Value: { Symbol, Tagged }} = require('../language/data');
var { isArray } = Array;

// -- Helpers ----------------------------------------------------------
function flatten(xs) {
  return xs.reduce(λ[# +++ #], [])
}

function merge(obj, metas) {
  return metas.reduce(function(r, m) {
    if (m.key in r)
      console.warn("WARNING: key '" + m.key + "' already exists. Overriding with " + show(m.value));

    r[m.key] = m.value;
    return r;
  }, Object.create(obj))
}

function collectMeta {
  Tagged(Symbol('meta'), m)        => [m],
  Tagged(Symbol('section'), *)     => [],
  Tagged(Symbol('declaration'), *) => [],
  Tagged(*, xs) if isArray(xs)     => flatten(xs.map(collectMeta)),
  xs @ Array                       => flatten(xs.map(collectMeta)),
  *                                => []
}

// -- Implementation ---------------------------------------------------
function transformation {
  Tagged(Symbol('declaration'), x) =>
    Tagged(Symbol('declaration'),
           extend(x, { meta: merge(x.meta, collectMeta(x.children)),
                       children: x.children.map(transformation) })),

  Tagged(Symbol('section'), x) =>
    Tagged(Symbol('section'),
           extend(x, { meta: merge(x.meta, collectMeta(x.children)),
                       children: x.children.map(transformation) })),

  xs @ Array => xs.map(transformation),
  node => node
}

// -- Exports ----------------------------------------------------------
module.exports = transformation
