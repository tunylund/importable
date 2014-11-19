(function(define) {

  function Library() {
    var factories = [],
        exports = {};
   
    function _export(name, definition) { 
      exports[name] = definition; 
    };
    
    this.extend = function extend(factory) {
      factories = factories.concat(Array.prototype.slice.call(arguments));
    };

    this.consume = function consume() {
      var factory;
      while(factory = factories.splice(0,1)[0]) {
        factory(_export)
      }
      return exports;
    }
  }

  var libraries = {};
  
  function provide(requirements) {
    return {
      from: function(librayName) {
        var library = libraries[librayName];
        if(!library) throw new Error("'" + librayName + "' has not been defined");
        var exports = library.consume();
        for(var result = [], i=0, l=requirements.length; i<l; i++) {
          var requirementName = requirements[i],
              requirement = exports[requirementName];
          if(exports.hasOwnProperty(requirementName)) {
            result.push(requirement)
          } else {
            throw new Error("Requirement '" + requirementName + "' from '" + librayName + "' was not found");
          }
        }
        return result.length == 1 ? result[0] : result
      }
    }
  }
  
  function _import(requirements) {
    requirements = Array.prototype.slice.call(arguments);
    return provide(requirements);
  }

  _import.module = function _module(librayName, factory) {
    libraries[librayName] = libraries[librayName] || new Library();
    libraries[librayName].extend(factory)
  }

  define('_import', _import);

}(//amd (requirejs)
  (typeof define === 'function' && define.amd) ? define :
  //common (node)
  (typeof exports != 'undefined' || typeof module != 'undefined') ? function(n, d, f) { exports = module.exports = f || d || n } :
  //no-modules (window)
  (function(n, d, f) {this[n] = f || d})
));
