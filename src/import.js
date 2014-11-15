(function(define) {

  function _once(fn, _export) {
    var c;
    return function() {
      return c || (c = fn());
    }
  }

  define('_import', function _import(factory) {

    if(typeof factory === 'function') {
      var library = {},
          _export = function(name, definition) { library[name] = definition; };
      return _once(function() {
        factory(_export);
        return library;
      });
    } else {
      var requested = Array.prototype.slice.call(arguments);
      return {from: function(lib) {
        for(var result = [], i=0, l=requested.length; i<l; i++) {
          result.push(lib()[requested[i]])
        }
        return result.length == 1 ? result[0] : result
      }}
    }

  })

}(//amd (requirejs)
  (typeof define === 'function' && define.amd) ? define :
  //common (node)
  (typeof exports != 'undefined' || typeof module != 'undefined') ? function(n, d, f) { exports = module.exports = f || d || n } :
  //no-modules (window)
  (function(n, d, f) {this[n] = f})
));
