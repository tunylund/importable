var assert = require("assert"),
    path = require("path"),
    _import;
describe('import', function(){

  beforeEach(function() {
    delete require.cache[path.resolve(__dirname, "../src/import.js")]
    _import = require("../src/import")
  })

  it('should return the requested component', function(){
    _import.module('library', function (_export) {
      _export('foo', 1);
    });
    assert.equal(1, _import('foo').from('library'))
  })

  it('should throw on undefined components', function(){
    _import.module('library', function (_export) {});
    assert.throws(function() {
      _import('foo').from('library')
    })
  })

  it('should return an array of components when requested', function(){
    _import.module('library', function (_export) {
      _export('foo', 1)
      _export('bar', 2)
    });
    assert.deepEqual([1, 2], _import('foo', 'bar').from('library'))
  })

  it('should evaluate lazily', function(){
    var evaluated = false
    _import.module('library', function (_export) {
      _export('foo', (evaluated = true))
    });
    assert.equal(false, evaluated)
    _import('foo').from('library')
    assert.equal(true, evaluated)
  })

  it('should allow extending', function() {
    _import.module('library', function (_export) {
      _export('foo', 1)
    });
    _import.module('library', function (_export) {
      _export('bar', 2)
    })
    assert.deepEqual([1, 2], _import('foo', 'bar').from('library'))
  })

  it('should not mix libraries', function() {
    _import.module('libraryA', function (_export) {
      _export('foo', 1)
    });
    _import.module('libraryB', function (_export) {
      _export('foo', 2)
    })
    assert.equal(1, _import('foo').from('libraryA'))
    assert.equal(2, _import('foo').from('libraryB'))
  })

  it('should resolve dependencies', function() {
    _import.module('libraryA', function (_export) {
      _export('foo', 1)
    });
    _import.module('libraryB', function (_export) {
      var foo = _import('foo').from('libraryA')
      _export('bar', foo + 1)
    })
    assert.equal(1, _import('foo').from('libraryA'))
    assert.equal(2, _import('bar').from('libraryB'))
  })

  it('should resolve dependencies independent of declaration order', function() {
    _import.module('libraryA', function (_export) {
      var bar = _import('bar').from('libraryB')
      _export('foo', bar-1)
    });
    _import.module('libraryB', function (_export) {
      _export('bar', 2)
    })
    assert.equal(1, _import('foo').from('libraryA'))
    assert.equal(2, _import('bar').from('libraryB'))
  })

  it('should raise on cyclic dependencies', function() {
    _import.module('libraryA', function libraryA(_export) {
      var bar = _import('bar').from('libraryB')
      _export('foo', bar-1)
    });
    _import.module('libraryB', function libraryB(_export) {
      var foo = _import('foo').from('libraryA')
      _export('bar', foo+1)
    })
    assert.throws(function() {
      assert.equal(1, _import('foo').from('libraryA'))
    });
    assert.throws(function() {
      assert.equal(2, _import('bar').from('libraryB'))
    })
  })
})
