// # module: Dollphie.ast
//
// Provides a representation of the AST.

var { Base, Cata } = require('adt-simple');

union Arg {
  Named(Id, Expr),
  Pos(Expr)
} deriving (Base, Cata)
exports.Arg = Arg;

union Block {
  SimpleBlock(String),
  RawBlock(String),
  EmptyBlock
} deriving (Base, Cata)
exports.Block = Block;

data ArgList(Array) 
  deriving (Base)
exports.ArgList = ArgList;

data ExprList(Array)
  deriving (Base)
exports.ExprList = ExprList;

data DeclList(Array) 
  deriving (Base)
exports.DeclList = DeclList;

data ParamList(Array) 
  deriving (Base)
exports.ParamList = ParamList;

union Expr {
  Str(String),
  Num(Number),
  Bool(Boolean),
  Id(String),
  Symbol(String),
  Nil,
  Vector(Array),
  App(Expr, ArgList, Block),
  Define(Id, ParamList, ExprList),
  Let(DeclList, ExprList),
  IfThenElse(Expr, Expr, Expr),
  Fun(ParamList, ExprList),
  Quote(Expr),
  Document(ExprList),
  Context(Number /* depth */, Function /* ([Expr] -> Expr) Regrouping */)
} deriving (Base, Cata)
exports.Expr = Expr;
