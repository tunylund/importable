(function(define) {

  function Module(moduleName) {
    var factories = [],
        exports = {},
        index = {}
   
    function _export(name, definition) { 
      exports[name] = definition; 
      delete index[name];
    };
    
    function consume(factory) {
      for(var i in index) {
        if(index[i] === factory) {
          delete index[i];
        }
      }
      factories.splice(factories.indexOf(factory), 1);
      factory(_export)
    }

    this.extend = function extend(factory) {
      factories.push(factory);
    };

    this.promise = function promise(promises, factory) {
      var args = Array.prototype.slice.call(arguments),
          factory = args.pop();
      while(p = args.pop()) {
        index[p] = factory;
      }
      factories.push(factory)
    }

    this.resolve = function resolve(requirementName) {
      if(requirementName) {
        var factory = index[requirementName];
        if (factory) consume(factory)
        return exports[requirementName];
      } else {
        var e = [];
        while(factory = factories.pop()) {
          e.push(consume(factory))
        }
        return e;
      }
    }
  }

  var modules = {},
      dependencyStack = [],
      resolvingStack = [];

  function Require(requirements) { this.requirements = requirements; }
  Require.prototype.from = function (moduleName) {
    var _module = modules[moduleName];
    if(!_module) throw new Error("'" + moduleName + "' has not been defined");
    
    var result = [],
        requirementName,
        requirement;
    while(requirementName = this.requirements.splice(0,1)[0]) {
      resolvingStack.push(requirementName + moduleName)
      requirement = _module.resolve(requirementName)
      if(typeof requirement === "undefined") {
        if(resolvingStack.indexOf(requirementName + moduleName) < resolvingStack.length-1) 
          throw new Error("Circular dependency while looking for '" + requirementName + "' from '" + moduleName + "'.");
        else 
          throw new Error("Requirement '" + requirementName + "' is not met by '" + moduleName + "'.");
      }
      result.push(requirement)
      resolvingStack.pop()
    }

    return result.length == 1 ? result[0] : result
  }
  
  function _import(requirements) {
    requirements = Array.prototype.slice.call(arguments);
    return new Require(requirements);
  }

  _import.module = function _module(moduleName) {
    modules[moduleName] = modules[moduleName] || new Module(moduleName);
    return modules[moduleName];
  }

  define('_import', _import);

}(//amd (requirejs)
  (typeof define === 'function' && define.amd) ? define :
  //common (node)
  (typeof exports != 'undefined' || typeof module != 'undefined') ? function(n, d, f) { exports = module.exports = f || d || n } :
  //no-modules (window)
  (function(n, d, f) {this[n] = f || d})
));
