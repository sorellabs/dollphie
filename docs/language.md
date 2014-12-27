Dollphie
========

Dollphie is a structured document language inspired by
[Scribble](http://docs.racket-lang.org/scribble/), and mainly designed for
documenting source code. It's also a retake on my previous attempt at
[a similar language for annotating source code](http://robotlolita.me/2013/02/23/unfancy-documentation.html),
but this is more light-weight, more general, and more expressive.


## 0. Overview

Dollphie is a Lisp-like language with lightweight syntax for writing large
amount of text, and some syntactical sugar for inline formatting. Unlike
languages like LaTeX, Dollphie has a consistent grammar, and is not tied to a
particular output format.

A documentation for a module could be written in Dollphie as follows:

    # module: Operators

    Provides operators as first-class functions.

    -- Core operators --------------------------------------------------

    ### function: add

    Returns the sum of two *numbers*.

    @type{Number -> Number -> Number}
    @code('js) ::
      function add(a){ return function(b) {
        return a + b
      }}

    -- Exports ---------------------------------------------------------

    @code('js){{{
      module.exports = add
    }}}

Once we desugar the document, we get the following Dollphie code:

    @module(1 "Operators")
    @text("Provides operators as first-class functions.")
    @section(2 "Core operators")
    @function(3 "add")
    @text("Returns the sum of two " @bold("numbers."))
    @type("Number -> Number -> Number")
    @code('js "function add(a){ return function(b) {
      return a + b
    }}")
    @section(2 "Exports")
    @code('js "module.exports = add")


## 1. Formal syntax

Dollphie is a fairly simple Lisp dialect:

```hs
eol   = "\n" | "\r"
space = EOL | " " | "\t"

digit  = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
digits = digit+
number = digits ("." digits)?

escapedChar = "\\" char
stringChar  = escapedChar | not("\"")
string      = "\"" stringChar* "\""

reserved  = "define" | "let" | "if" | "fun" | "quote"
special   = "{" | "}" | "(" | ")" | "[" | "]" | ":" | "'" | "\"" | "@"
nameStart = not(special | digit | space)
nameRest  = not(special | space)
name      = nameStart nameRest*      [unless reserved]

bool = "true" | "false"
nil = "nil"
vector = "[" value* "]"
symbol = "'" name
value  = number | string | name | symbol | vector | nil

call           = "@" name callArgs? callBlock?
callArgs       = "(" callExpression* ")"
callExpression = name [no space here] ":" expression
               | expression
callBlock      = simpleBlock | rawBlock | indentBlock
simpleBlock    = "{" ["\\}" or anything but "}"] "}"
rawBlock       = "{{{" [anything but "}}}"] "}"
indentBlock    = "::" INDENT [anything] DEDENT

def  = "@define" "(" name args expression* ")"
args = "[" name* "]"

let       = "@let" "(" letVector expression* ")"
letVector = "[" (name [no space here] ":" value)+ "]"

if = "@if" "(" expression "then:" expression "else:" expression ")"

fun = "@fun" "(" args expression* ")"

quote = "@raw" "(" expression ")"

expression = let | if | fun | def | quote | call | value
document   = expression*
```

The sugared dialect has the following grammar:

```hs
heading = section | declaration
block = paragraph | expression

section = '-'+ title '-'*
title = not('-')*
declaration = '#'+ name [no space here] ':' qualifiedName '#'*

qualifiedName = name ('.' name)*

hardLine = '|' text+ EOL
softLine = text+ EOL
blankLine = ws EOL
paragraph = (hardLine | softLine)+ blankLine

strong = '\\*' | '*' text+ '*'
italic = '\\/' | '/' text+ '/'
formatting = strong | italic

text = expression | formatting | word
word = [anything but whitespace]
```
