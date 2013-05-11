Dollphie
========

Dollphie is a language for annotating source code, it's a retake on my previous
attempt at
[a similar language for annotating source code](http://killdream.github.io/blog/2013/02/unfancy-documentation/index.html),
but this one is more general and more light-weight, and specifies the full
language rather than relying on Markdown.


## 0. Overview

The language follows a kind-of literate programming approach, by structuring
source code through a text document, rather than language rules:

    # Module operators
    
    Provides operators as first-class functions.
    
    
    -- Core operators ------------------------------------------------------
    
    ### Function add
    
    Returns the sum of two numbers
    
    :: number -> number -> number
    
    :code: js
      function add(a) { return function(b) {
        return a + b
      }}
      
    -- Exports -------------------------------------------------------------
    
    :code: js
      module.exports = add


Like the previous version, the structure is defined by the number of leading
symbols of a given kind, except that instead of using comment characters we're
using Dollphie symbols here.

The same file could be written in JavaScript like this:

```js
// # Module operators
//
// Provides operators as first-class functions.

// -- Core operators ---------------------------------------------------

// ### Function add
//
// Returns the sum of two numbers
//
// :: number -> number -> number
function add(a) { return function(b) {
  return a + b
}}

// -- Exports ----------------------------------------------------------
module.exports = add
```

Note that the only difference is that now Dollphie-specific notation is just
prefixed by the comment characters in the language. This makes supporting any
other language much more straight-forward.

At a high level, Dollphie is a language that's structured in headings,
declarations and text blocks, and in this way it's very similar to
[Markdown](http://daringfireball.net/projects/markdown/), however it's also an
extensible and formally specified language more suited for describing
programming constructs.


## 1. 
