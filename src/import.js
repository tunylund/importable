(function(define) {

  function createLibrary() {
    var factories = [],
        library = {};
   
    function api() {
      if(arguments.length > 0) {
        extend.apply(this, arguments)
        return api;
      } else {
        consume();
        return library;
      }
    };

    function extend(factory) {
      factories = factories.concat(Array.prototype.slice.call(arguments));
    };

    function _export(name, definition) { 
      library[name] = definition; 
    };
    
    function consume() {
      var factory;
      while(factory = factories.splice(0,1)[0]) {
        factory(_export)
      }
    }

    return api;
  }

  function provide(requested) {
    return {from: function(lib) {
      for(var result = [], i=0, l=requested.length; i<l; i++) {
        result.push(lib()[requested[i]])
      }
      return result.length == 1 ? result[0] : result
    }}
  }

  define('_import', function _import(factory) {

    if(typeof factory === 'function') {
      var library = createLibrary()
      return library(factory);
    } else {
      var requested = Array.prototype.slice.call(arguments);
      return provide(requested)
    }

  })

}(//amd (requirejs)
  (typeof define === 'function' && define.amd) ? define :
  //common (node)
  (typeof exports != 'undefined' || typeof module != 'undefined') ? function(n, d, f) { exports = module.exports = f || d || n } :
  //no-modules (window)
  (function(n, d, f) {this[n] = f})
));
