var assert = require("assert"),
    _import = require("../src/import")
describe('import', function(){
  it('should return the requested component', function(){
    var library = _import(function (_export) {
      _export('foo', 1);
    });
    assert.equal(1, _import('foo').from(library))
  })

  it('should return null for undefined components', function(){
    var library = _import(function (_export) {});
    assert.equal(null, _import('foo').from(library))
  })

  it('should return an array of components when requested', function(){
    var library = _import(function (_export) {
      _export('foo', 1)
      _export('bar', 2)
    });
    assert.deepEqual([1, 2], _import('foo', 'bar').from(library))
  })

  it('should evaluate lazily', function(){
    var evaluated = false,
        library = _import(function (_export) {
          _export('foo', (evaluated = true))
        });
    assert.equal(false, evaluated)
    _import('foo').from(library)
    assert.equal(true, evaluated)
  })

  it('should allow extending', function() {
    var library = _import(function (_export) {
      _export('foo', 1)
    });
    library(function (_export) {
      _export('bar', 2)
    })
    assert.deepEqual([1, 2], _import('foo', 'bar').from(library))
  })

  it('should not mix libraries', function() {
    var libraryA = _import(function (_export) {
      _export('foo', 1)
    });
    var libraryB = _import(function (_export) {
      _export('foo', 2)
    })
    assert.equal(1, _import('foo').from(libraryA))
    assert.equal(2, _import('foo').from(libraryB))
  })

})
