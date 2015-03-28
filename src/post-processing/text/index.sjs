// # module: Dollphie.text
//
// A module that allows processing of Dollphie text into different
// formats: ReStructured Text, Markdown, etc.
module.exports = {
  identity: {
    description: "Don't do any transformation to the text.",
    transformation: function(ast){ return ast }
  },

  markdown: require('./markdown')
}
