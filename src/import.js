(function(define) {

  function Module(moduleName) {
    
    var exports = {},
        factories = {};
   
    function _export(name, definition) { 
      exports[name] = definition; 
    }

    function _consume(name) {
      if (!exports.hasOwnProperty(name)) {
        var factory = factories[name];
        if (factory) factory(_export)
        else throw new Error("Requirement '" + name + "' is not met by '" + moduleName + "'.");
      }
    }
    
    this.reset = function reset() {
      exports = {}
    }

    this.promise = function promise(promises, factory) {
      var args = Array.prototype.slice.call(arguments),
          factory = args.pop();
      while(p = args.pop()) {
        factories[p] = factory;
      }
      return this;
    }

    this.resolve = function resolve(requirementName) {
      exports[requirementName] || _consume(requirementName)
      return exports[requirementName];
    }

  }

  var modules = {},
      dependencyStack = [],
      resolvingStack = [];

  function resolve(requirements, moduleName) {
    var _module = modules[moduleName];
    
    if(!_module) {
      throw new Error("'" + moduleName + "' has not been defined");
    }
    
    var result = [],
        requirementName,
        requirement,
        stackName;
    
    while (requirementName = requirements.splice(0,1)[0]) {
      
      stackName = moduleName + '.' + requirementName
      if (resolvingStack.indexOf(stackName) > -1) {
        throw new Error("Circular dependency while looking for '" + requirementName + "' from '" + moduleName + "'.");
      }
      
      resolvingStack.push(stackName)
      requirement = _module.resolve(requirementName)
      result.push(requirement)
      resolvingStack.pop()
    }

    return result.length == 1 ? result[0] : result
  }

  function _import(requirements) {
    var reqs = Array.prototype.slice.call(arguments)
    return {
      from: function(moduleName) {
        return resolve(reqs, moduleName);
      }
    }
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
