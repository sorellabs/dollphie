// # module: eval
//
// A meta-circular evaluator for Dollphie documents.

// -- Dependencies -----------------------------------------------------
var Maybe = require('data.maybe');
var { curry } = require('core.lambda');
var { Arg, Block, ArgList, ExprList, DeclList, ParamList, Expr } = require('./ast');
var { List, Value } = require('./data');

var { Named, Post } = Arg;
var { SimpleBlock, RawBlock, EmptyBlock } = Block;
var { Str, Num, Bool, Id, Symbol, Nil, Vector, App
    , Define, Let, IfThenElse, Fun, Quote, Document } = Expr;

var { Sym:Symbol, Applicative, Lambda } = Value;

var keys = Object.keys;

// -- Helpers ----------------------------------------------------------

// ### function: lookup
// @private
// @type: String, Environment → Value :: throws
function lookup(id, env) {
  if (id in env) {
    return env[id]
  } else {
    throw new ReferenceError(id + ' is not defined.')
  }
}

// ### function: set
// @private
// @type: Object<α>, String, α → Object<α>
function set(o, key, value) {
  o[key] = value;
  return o
}

// ### function: argsToObject
// @private
// @type: [String], [Value], Object<Value>, Block → Object<Value>
argsToObject = curry(4, argsToObject);
function argsToObject(pos, named, block, params) {
 var lamPosArgs = params.filter(λ[named.indexOf(#) === -1]);
  var lamNamArgs = params.filter(λ[named.indexOf(#) !== -1]);

  var e1 = lamNamArgs.reduce(λ(r,x) -> set(r, x, named[x]), {});
  var e2 = lamPosArgs.reduce(λ(r,x,i) -> set(r, x, pos[i]), e1);
  var e3 = match block {
    SimpleBlock(a) => set(e2, 'block', a.trim()),
    RawBlock(a)    => set(e2, 'block', a),
    EmptyBlock     => e2
  };

  return e3
}

// ### function: apply
// @private
// @type: Environment, Value, Object<Value>, Block → Value
function apply(env, op, args, block) {
  var toObject = argsToObject(args[0], args[1], block);

  return match op {
    Applicative(params, f)      => f(toObject(params)),
    Lambda(env2, params, sexps) => eval(env2.derive(toObject(params), sexps))
  }
}

// ### function: evalArgs
// @private
// @type: Environment, [Arg] → #[[Value], Object<Value>]
function evalArgs(env, xs) {
  var pos   = xs.filter(λ[# instanceof Pos]).map(λ[#.0]);
  var named = xs.filter(λ[# instanceof Named]).map(λ[#.0]);

  return [ pos.map(eval(env))
         , named.reduce(λ(r, x) -> set(r, x, eval(env, x)), {})
         ]
}

// ### function: unboxId
// @private
// @type: Id → String
function unboxId {
  Id(a) => a
}

// ### function: define
// @private
// @type: Environment, String, [String], [Expr] → Lambda
function define(env, name, args, sexps) {
  return env[name] = Lambda(env, args, sexps);
}

// ### function: evalLet
// @private
// @type: Environment, [(String, Value)], [Expr] → Value
function evalLet(env, decls, sexps) {
  var newEnv = decls.reduce(λ(r,p) -> set(r, p[0], p[1]), {});
  return eval(env.derive(newEnv), ExprList(sexps))
}

// ### function: evalCond
// @private
// @type: Environment, Expr, Expr, Expr → Value
function evalCond(env, test, consequent, alternate) {
  var value = eval(env, test);
  if (value === false || value === List.Nil) {
    return eval(env, alternate)
  } else {
    return eval(env, consequent)
  }
}

// ### function: last
// @private
// @type: [α] → Maybe<α>
function last(xs) {
  return xs.length > 0?   Maybe.Just(xs[xs.length - 1])
  :      /* otherwise */  Maybe.Nothing()
}


// -- Core implementation ----------------------------------------------

// ### function: eval
//
// Evaluates an expression in the given environment.
//
// @type: Environment → Expr → Value
exports.eval = eval = curry(2, eval);
function eval(env, sexp) {
  return match sexp {
    Str(a)                                         => a,
    Num(a)                                         => a,
    Bool(a)                                        => a,
    Id(a)                                          => lookup(a, env),
    Symbol(a)                                      => Sym(a),
    Nil                                            => List.Nil,
    Vector(xs)                                     => xs.map(eval(env)),
    App(op, ArgList(args), b)                      => apply( env
                                                           , eval(env, op)
                                                           , args.map(eval(env))
                                                           , b),
    Define(Id(id), ParamList(xs), ExprList(sexps)) => define(env, id, xs, sexps),
    Let(DeclList(xs), ExprList(sexps))             => evalLet(env, xs, sexps),
    IfThenElse(a, b, c)                            => evalCond(env, a, b, c),
    Fun(ParamList(xs), ExprList(sexps))            => Lambda( env.derive()
                                                            , xs.map(unboxId)
                                                            , sexps),
//    Quote(a)                                       => a,
    Document(xs)                                   => eval(env, xs),
    ExprList(xs)                                   => last(xs.map(eval(env))) 
                                                  <|> List.Nil
  }
}

