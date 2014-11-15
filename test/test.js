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
})
