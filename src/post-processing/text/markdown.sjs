// # module: Dollphie.text.markdown
//
// Transforms text markup into Markdown.

// -- Dependencies -----------------------------------------------------
var extend = require('xtend');
var { Value: { Symbol, Applicative, Lambda, Tagged } } = require('../../language/data');


// -- Helpers ----------------------------------------------------------
function mapObject(a, f) {
  return Object.keys(a).reduce(function(r, k) {
    r[k] = f(a[k]);
    return r
  }, {})
}

function isPlainObject(o) {
  return o && (o.toString() === '[object Object]')
}


// -- Implementation ---------------------------------------------------
function transformation {
  Tagged(Symbol('paragraph'), xs) =>
    Tagged(Symbol('paragraph'), xs.map(transformation)),

  Tagged(Symbol('text'), xs) =>
    Tagged(Symbol('text'), xs.map(transformation)),

  Tagged(Symbol('bold'), Tagged(Symbol('text'), xs)) => 
    Tagged(Symbol('text'), ['**'] +++ xs +++ ['**']),

  Tagged(Symbol('italic'), Tagged(Symbol('text'), xs)) =>
    Tagged(Symbol('text'), ['*'] +++ xs +++ ['*']),

  Tagged(t, data) => Tagged(t, transformation(data)),

  // Text has to escape markdown special symbols
  a @ String => a.replace(/([\*_\-#])/g, '\\$1'),

  // Arrays have to have all its components transformed
  xs @ Array => xs.map(transformation),

  // Likewise objects need all its components transformed
  o if isPlainObject(o) => mapObject(o, transformation),

  // All other nodes can be ignored
  node => node
}


// -- Exports ----------------------------------------------------------
module.exports = {
  description: "Formats text as Markdown.",
  transformation: transformation
}
