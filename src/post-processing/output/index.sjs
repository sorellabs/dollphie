// # module: Dollphie.output
//
// Describes ways in which documentation meta-data may be output.
module.exports = {
  identity: {
    description: 'Output documentation as-is.',
    transformation: function(ast){ return ast }
  },

  markdown: require('./markdown'),
  sphinx: require('./rst')
}
