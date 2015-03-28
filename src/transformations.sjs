// # module: transformations
//
// AST transformations that need to be done before evaluation.

// -- Dependencies -----------------------------------------------------
var Maybe = require('data.maybe');
var show = require('core.inspect');
var { ExprList, Expr } = require('./ast');
var { Document, Context } = Expr;

// -- Desugaring -------------------------------------------------------
//
// Some constructs in the sugared version of Dollphie can't be compiled
// directly to the proper AST. Section and Declaration require a
// separate desugaring step for correctly nesting the nodes.
exports.desugar = desugar;
function desugar {
  Document(ExprList(xs)) => Document(ExprList(rebuildAst(xs)));
}

function rebuildAst(nodes) {
  return nodes.reduce(function(context, expression) {
    (match expression {
      Context(depth, realiser) => context.push(depth, realiser),
      *                        => context.assimilate(expression)
    });
    return context;
  }, new DesugaringContext).getRoots();
}

function RealisableNode(depth, realiser) {
  this.depth    = depth;
  this.realiser = realiser;
  this.children = [];
}

RealisableNode::assimilate = function(expression) {
  this.children.push(expression);
}

RealisableNode::realise = function() {
  return this.realiser(this.children.map(λ[#.realise()]));
}


function IdentityNode(expression) {
  this.expression = expression;
}

IdentityNode::assimilate = function(expression) {
  throw new Error("Identity node for " + show(this.expression) + " can't assimilate others.");
}

IdentityNode::realise = function() {
  return this.expression
}


function DesugaringContext() {
  this.stack = [];
  this.current = Maybe.Nothing();
  this.roots = [];
}

DesugaringContext::assimilate = function(expression) {
  return this.current.cata({
    Nothing: function(){
      var node = new IdentityNode(expression);
      this.roots.push(node);
      return node;
    }.bind(this),
    Just: function(node){
      return node.assimilate(new IdentityNode(expression));
    }.bind(this)
  })
}

DesugaringContext::push = function(depth, realiser) {
  return this.current.cata({
    Nothing: function(){
      var node = replaceCurrent(this, Maybe.Nothing());
      this.roots.push(node);
      return node;
    }.bind(this),
    Just: function(node){
      if (depth > node.depth) {
        this.stack.push(node);
        return replaceCurrent(this, Maybe.Just(node));
      } else {
        this.current = Maybe.fromNullable(this.stack.pop());
        return this.push(depth, realiser);
      }
    }.bind(this)
  });

  function replaceCurrent(self, parent) {
    var node = new RealisableNode(depth, realiser);
    self.current = Maybe.Just(node);
    parent.map(function(p){ p.assimilate(node) });
    return node;
  }
}

DesugaringContext::getRoots = function() {
  return this.roots.map(λ[#.realise()]);
}
