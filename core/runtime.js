// The Opal object that is exposed globally
var Opal = this.Opal = {};

// Core Object class
function Object(){}

// Class' class
function Class(){}

// the class of nil
function NilClass(){}

// TopScope is used for inheriting constants from the top scope
var TopScope = function(){};

// Opal just acts as the top scope
TopScope.prototype = Opal;

// To inherit scopes
Opal.alloc  = TopScope;

// This is a useful reference to global object inside ruby files
Opal.global = this;

// Minify common function calls
var __hasOwn = Opal.hasOwnProperty;
var __slice  = Opal.slice = Array.prototype.slice;

// Generates unique id for every ruby object
var unique_id = 0;

// Table holds all class variables
Opal.cvars = {};

// Globals table
Opal.gvars = {};

Opal.klass = function(base, superklass, id, constructor) {
  var klass;
  if (base._isObject) {
    base = base._klass;
  }

  if (superklass === null) {
    superklass = Object;
  }

  if (__hasOwn.call(base._scope, id)) {
    klass = base._scope[id];
  }
  else {
    if (!superklass._methods) {
      var bridged = superklass;
      superklass  = Object;
      klass       = bridge_class(bridged);
    }
    else {
      klass = boot_class(superklass, constructor);
    }

    klass._name = (base === Object ? id : base._name + '::' + id);

    var const_alloc   = function() {};
    var const_scope   = const_alloc.prototype = new base._scope.alloc();
    klass._scope      = const_scope;
    const_scope.alloc = const_alloc;

    base[id] = base._scope[id] = klass;

    if (superklass.$inherited) {
      superklass.$inherited(klass);
    }
  }

  return klass;
};

// Define new module (or return existing module)
Opal.module = function(base, id, constructor) {
  var klass;
  if (base._isObject) {
    base = base._klass;
  }

  if (__hasOwn.call(base._scope, id)) {
    klass = base._scope[id];
  }
  else {
    klass = boot_class(Class, constructor);
    klass._name = (base === Object ? id : base._name + '::' + id);

    klass._isModule = true;
    klass.$included_in = [];

    var const_alloc   = function() {};
    var const_scope   = const_alloc.prototype = new base._scope.alloc();
    klass._scope      = const_scope;
    const_scope.alloc = const_alloc;

    base[id] = base._scope[id]    = klass;
  }

  return klass;
}

// Utility function to raise a "no block given" error
var no_block_given = function() {
  throw new Error('no block given');
};

// Boot a base class (makes instances).
var boot_defclass = function(id, constructor, superklass) {
  if (superklass) {
    var ctor           = function() {};
        ctor.prototype = superklass.prototype;

    constructor.prototype = new ctor();
  }

  var prototype = constructor.prototype;

  prototype.constructor = constructor;
  prototype._isObject   = true;
  prototype._klass      = constructor;

  constructor._included_in  = [];
  constructor._isClass      = true;
  constructor._name         = id;
  constructor._super        = superklass;
  constructor._methods      = [];
  constructor._smethods     = [];
  constructor._isObject     = false;

  constructor._donate = __donate;
  constructor._sdonate = __sdonate;

  Opal[id] = constructor;

  return constructor;
};

// Create generic class with given superclass.
var boot_class = function(superklass, constructor) {
  var ctor = function() {};
      ctor.prototype = superklass.prototype;

  constructor.prototype = new ctor();
  var prototype = constructor.prototype;

  prototype._klass      = constructor;
  prototype.constructor = constructor;

  constructor._included_in  = [];
  constructor._isClass      = true;
  constructor._super        = superklass;
  constructor._methods      = [];
  constructor._isObject     = false;
  constructor._klass        = Class;
  constructor._donate       = __donate
  constructor._sdonate      = __sdonate;

  constructor['$==='] = module_eqq;
  constructor.$to_s = module_to_s;

  var smethods;

  smethods = superklass._smethods.slice();

  constructor._smethods = smethods;
  for (var i = 0, length = smethods.length; i < length; i++) {
    var m = smethods[i];
    constructor[m] = superklass[m];
  }

  return constructor;
};

var bridge_class = function(constructor) {
  constructor.prototype._klass = constructor;

  constructor._included_in  = [];
  constructor._isClass      = true;
  constructor._super        = Object;
  constructor._klass        = Class;
  constructor._methods      = [];
  constructor._smethods     = [];
  constructor._isObject     = false;

  constructor._donate = function(){};
  constructor._sdonate = __sdonate;

  constructor['$==='] = module_eqq;
  constructor.$to_s = module_to_s;

  var smethods = constructor._smethods = Class._methods.slice();
  for (var i = 0, length = smethods.length; i < length; i++) {
    var m = smethods[i];
    constructor[m] = Object[m];
  }

  bridged_classes.push(constructor);

  var table = Object.prototype, methods = Object._methods;

  for (var i = 0, length = methods.length; i < length; i++) {
    var m = methods[i];
    constructor.prototype[m] = table[m];
  }

  constructor._smethods.push('$allocate');

  return constructor;
};

Opal.puts = function(a) { console.log(a); };

// Initialization
// --------------

boot_defclass('Object', Object);
boot_defclass('Class', Class, Object);

Class.prototype = Function.prototype;
Object._klass = Class._klass = Class;

// Implementation of Class#===
function module_eqq(object) {
  if (object == null) {
    return false;
  }

  var search = object._klass;

  while (search) {
    if (search === this) {
      return true;
    }

    search = search._super;
  }

  return false;
}

// Implementation of Class#to_s
function module_to_s() {
  return this._name;
}

// Donator for all 'normal' classes and modules
function __donate(defined, indirect) {
  var methods = this._methods, included_in = this.$included_in;

  // if (!indirect) {
    this._methods = methods.concat(defined);
  // }

  if (included_in) {
    for (var i = 0, length = included_in.length; i < length; i++) {
      var includee = included_in[i];
      var dest = includee.prototype;

      for (var j = 0, jj = defined.length; j < jj; j++) {
        var method = defined[j];
        dest[method] = this.prototype[method];
      }

      if (includee.$included_in) {
        includee._donate(defined, true);
      }
    }

  }
}

// Donator for singleton (class) methods
function __sdonate(defined) {
  this._smethods = this._smethods.concat(defined);
}

var bridged_classes = Object.$included_in = [];

Object._scope = Opal;
Opal.Module = Opal.Class;
Opal.Kernel = Object;

var class_const_alloc = function(){};
var class_const_scope = new TopScope();
class_const_scope.alloc = class_const_alloc;
Class._scope = class_const_scope;

Object.prototype.toString = function() {
  return this.$to_s();
};

Opal.top = new Object;

Opal.klass(Object, Object, 'NilClass', NilClass)
Opal.nil = new NilClass;
Opal.nil.call = Opal.nil.apply = no_block_given;

Opal.breaker  = new Error('unexpected break');