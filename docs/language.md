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


## 1. Document Structure

Dollphie documents are structured as headings that contain blocks or other
headings. Headings can be either textual headings or element declarations, in
the latter case they create not only a new structure level, but also a new
annotated element.

Blocks are structures that contain either text or meta-data, but cannot contain
a heading. These are either paragraphs, signatures or custom meta-data.


### 1.1. Headings

Headings are introduced by either one or more leading dashes or one or more
leading pound signs. In both cases they create a new structural context at the
given level (which means they'll be nested at the closest, less deep,
context). New blocks will be nested inside this new context.

A heading can either be a section, for which we have no special
semantics. Sections are written with the leading dashes, trailing dashes are
optional:


    -- This is a section ---------------------------------------------------

    This is inside the section above

Sections are good for logically grouping elements, like chapters in books, or
topics in an article.

Headings can also be declarations, in which case we have special semantics for
them. Declarations are written with the leading pound symbols, trailing symbols
are optional:

    ## Module boo
    
    This is inside module boo.
    
For declarations, the first word defines the `type` of the declaration, and its
associated semantics, whereas the rest gives it a descriptive title.

Besides nesting things using the document structure, you can explicitly specify
the parent of a declaration construct by using `foo.bar` as its name, where
`bar` is the name of the declaration, and `foo` is its parent.


### 1.2. Blocks

Blocks are any unit of text that can be placed inside of headings. These
include paragraphs, signatures and custom meta-data.

#### 1.2.1. Paragraphs

Just like Markdown, Dollphie allows users to hard-wrap their lines in their
source, and it'll treat a bunch of lines as a single paragraph until a blank
line is found:

    This is the
    first paragraph.
    
    This is the second paragraph.
    
    And a third one!!
    
Line breaks can be introduced by starting the lines with a `|`:

    | This
    | Is
    | A
    | Single
    | Paragraph
    | but with many line breaks.
   
 
#### 1.2.2. Signatures

Type signatures can be specified for a declaration context, and these follow
the syntax for the [Oblige type notation](https://github.com/killdream/oblige)
language. This means that we can also talk about types using a standard
representation, so tools can do lots of awesome stuff with them.

Types are introduced with the `::` symbol, and can span multiple lines, as long
as they're indented to the right of the symbol:

    :: { x: number
       , y: number
       }
       

#### 1.2.3. Meta-data

Meta-data defines extension points in Dollphie. They are introduced by the
`:<name>: <parameters>` notation, and can actually contain blocks as the `body`
parameter, as long as they start on a new line, and are indented to the right
of the meta-data definition:

    :author: Le Me
    :licence:
      Copyright (c) ...
      
      More stuff can go here.

There are a few built-in meta-data constructions in Dollphie, which we'll visit
later on in this document. New meta-data can be defined with plain functions
that take in a context, parameters and a body, and returns a new new Dollphie
AST to replace the old token.


### 1.3. Inline markup

Lastly, we've got inline markup, which can be used anywhere in a
paragraph. These provide a way of visually formatting some text in a way that's
still readable in the source code.


#### 1.3.1. Block-quotes

Block quotes maintain Markdown's syntax, and should appear on a paragraph of
their own:

    > This is a quote
    
    > It can also
    > span multiple lines
    > As long as you mark all lines with >


#### 1.3.2. Lists

Unordered lists are marked with `*`, whereas ordered lists are marked with
`#)`, or `N)`, where `N` is a number.

      * item 1
      * item 2
      * item 3


      1) item 1
      2) item 2
      3) item 3
      #) item 4

Lists can contain any block, as long as they're indented 4-spaces:

      * item 1

        And more stuff about item 1

      * item 2

        And more stuff about item 2

As a rule of thumb, it's good to indent the list bullets two spaces, and the
text of the item two spaces too.


#### 1.3.3. Horizontal lines

Horizontal lines can be written as a series of three or more `*` characters,
optionally separated by a single white-space character:

    Something

    * * *

    Something else.


#### 1.3.4. Links

Absolute links, in the form of `http://...`, `www.foo.bar` or `foo@bar.com` are
automatically handled, you can define other links with a Wikipedia-style
notation:

    This will link to `foo`: [[#foo]]

    This will link to `foo`, but with a new name: [[#foo | Bar]]

    
You can inline images by prefixing the link with a exclamation mark:

    This will show you some kittens: ![[ kitten.jpeg ]]

    
Footnotes can be defined similarly to the wikipedia-style links:

    See [[1]]
 
    [1]: Lots of text can go here.

And lastly, we can link to any declaration by enclosing the link in colons:

    This will link to foo.bar [:foo.bar:]
    

#### 1.3.5. Emphasis

Dollphie supports different kinds of emphasis, italic, bold and strikethrough
are supported:

    *This is bold*

    /this is italic/
    
    +this is struck out+
    
    
#### 1.3.5. Literals

Code literals use the same `` ` `` symbol as Markdown:

    `this is a literal`
    
    
## 2. Formal syntax

```hs
heading :: section | declaration
block   :: paragraph | signature | meta

section :: "-"+ title "-"*
title   :: any character but "-"

declaration :: "#"+ type qualifiedId "#"*
type        :: "module"
             | "function"
             | "class"
             | "data"
             | "type"
id          :: any character but "." and space
qualifiedId :: id ("." id)*

hardLine  :: "|" text+ EOL
softLine  :: text+ EOL
blankLine :: space* EOL
paragraph :: (hardLine | softLine)+ blankLine

signature :: "::" INDENT <oblige/typeDef> DEDENT

meta :: ":" id ":" softLine (EOL INDENT block DEDENT)?

blockQuote :: (">" softLine)+

unorderedList :: "*" INDENT block+ DEDENT
orderedList   :: itemNumber ")" INDENT block+ DEDENT
itemNumber    :: "#" | number
number        :: ("0" .. "9")+

horizontalLine :: "*" (space? "*") (space? "*")+

link :: internetLink
      | imageLink
      | regularLink
      | footNote
      | entityLink
      
internetLink :: absoluteUrl
              | domainUrl
              | emailUrl
absoluteUrl  :: protocol "://" domain pathname?
domainUrl    :: "www." domain pathname?
emailUrl     :: username "@" domain
imageLink    :: "!" regularLink
regularLink  :: "[[" link ("|" link)? "]]"
link         :: anything but "[", "]" and "|"
footNote     :: "[[" number "]]"
entityLink   :: "[:" qualifiedId ":]"

emphasis   :: "\\*" | "*" text+ "*"
italic     :: "\\/" | "/" text+ "/"
strike     :: "\\+" | "+" text+ "+"
literal    :: "\\`" | "`" (anything but `) "`"
formatting :: emphasis | italic | strike | literal

text :: formatting | word
word :: anything but whitespace
```

