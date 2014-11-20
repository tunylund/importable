(function(define) {

  function Module() {
    var factories = [],
        exports = {}
   
    function _export(name, definition) { 
      exports[name] = definition; 
    };
    
    this.extend = function extend(factory) {
      factories = factories.concat(Array.prototype.slice.call(arguments));
    };

    this.resolve = function resolve() {
      var factory;
      while(factory = factories.splice(0,1)[0]) {
        factory(_export)
      }
      return exports;
    }
  }

  var modules = {},
      dependencyStack = [],
      resolvingStack = [];

  function Require(requirements) {
    this.requirements = requirements;
  }
  Require.prototype.from = function (moduleName) {
    if(resolvingStack.indexOf(moduleName) > -1) throw new Error("Circular dependency while looking for '" + this.requirements + "' from '" + moduleName + "'.");
    resolvingStack.push(moduleName)
    
    var module = modules[moduleName];
    if(!module) throw new Error("'" + moduleName + "' has not been defined");
    
    var exports = module.resolve();
    for(var result = [], i=0, l=this.requirements.length; i<l; i++) {
      var requirementName = this.requirements[i],
          requirement = exports[requirementName];
      if(!exports.hasOwnProperty(requirementName)) throw new Error("Requirement '" + requirementName + "' from '" + moduleName + "' was not found");
      result.push(requirement)
    }

    resolvingStack.pop()
    return result.length == 1 ? result[0] : result
  }
  
  function _import(requirements) {
    requirements = Array.prototype.slice.call(arguments);
    return new Require(requirements);
  }

  _import.module = function _module(moduleName, factory) {
    modules[moduleName] = modules[moduleName] || new Module();
    modules[moduleName].extend(factory)
  }

  define('_import', _import);

}(//amd (requirejs)
  (typeof define === 'function' && define.amd) ? define :
  //common (node)
  (typeof exports != 'undefined' || typeof module != 'undefined') ? function(n, d, f) { exports = module.exports = f || d || n } :
  //no-modules (window)
  (function(n, d, f) {this[n] = f || d})
));
