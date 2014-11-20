var assert = require("assert"),
    path = require("path"),
    _import;
describe('import', function(){

  beforeEach(function() {
    delete require.cache[path.resolve(__dirname, "../src/import.js")]
    _import = require("../src/import")
  })

  it('should return the requested promise', function(){
    _import.module('module').promise('foo', function (_export) {
      _export('foo', 1);
    });
    assert.equal(1, _import('foo').from('module'))
  })

  it('should throw on undefined components', function(){
    _import.module('module').promise(function (_export) {});
    assert.throws(function() {
      _import('foo').from('module')
    }, /Requirement .+ is not met/)
  })

  it('should return an array of components when requested', function(){
    _import.module('module').promise('foo', 'bar', function (_export) {
      _export('foo', 1)
      _export('bar', 2)
    });
    assert.deepEqual([1, 2], _import('foo', 'bar').from('module'))
  })

  it('should evaluate lazily', function(){
    var evaluated = false
    _import.module('module').promise('foo', function (_export) {
      _export('foo', (evaluated = true))
    });
    assert.equal(false, evaluated)
    _import('foo').from('module')
    assert.equal(true, evaluated)
  })

  it('should allow extending', function() {
    _import.module('module').promise('foo', function (_export) {
      _export('foo', 1)
    });
    _import.module('module').promise('bar', function (_export) {
      _export('bar', 2)
    })
    assert.deepEqual([1, 2], _import('foo', 'bar').from('module'))
  })

  it('should not mix libraries', function() {
    _import.module('moduleA').promise('foo', function (_export) {
      _export('foo', 1)
    });
    _import.module('moduleB').promise('foo', function (_export) {
      _export('foo', 2)
    })
    assert.equal(1, _import('foo').from('moduleA'))
    assert.equal(2, _import('foo').from('moduleB'))
  })

  it('should resolve dependencies', function() {
    _import.module('moduleA').promise('foo', function (_export) {
      _export('foo', 1)
    });
    _import.module('moduleB').promise('bar', function (_export) {
      var foo = _import('foo').from('moduleA')
      _export('bar', foo + 1)
    })
    assert.equal(1, _import('foo').from('moduleA'))
    assert.equal(2, _import('bar').from('moduleB'))
  })

  it('should resolve dependencies independent of declaration order', function() {
    _import.module('moduleA').promise('foo', function (_export) {
      var bar = _import('bar').from('moduleB')
      _export('foo', bar-1)
    });
    _import.module('moduleB').promise('bar', function (_export) {
      _export('bar', 2)
    })
    assert.doesNotThrow(function() {
      assert.equal(1, _import('foo').from('moduleA'))
      assert.equal(2, _import('bar').from('moduleB'))
    })
  })

  it('should not confuse cyclisism when one part of a module depends on another part of the same module', function() {
    _import.module('module').promise('foo', function module(_export) {
      var bar = _import('bar').from('module')
      _export('foo', bar-1)
    });
    _import.module('module').promise('bar', function module(_export) {
      _export('bar', 2)
    })
    assert.equal(1, _import('foo').from('module'))
    assert.equal(2, _import('bar').from('module'))
  })

  it('should not depend on declaration order', function() {
    _import.module('module').promise('foo', function moduleA(_export) {
      var bar = _import('bar').from('module')
      _export('foo', bar-1)
    });
    _import.module('module').promise('bar', function moduleB(_export) {
      _export('bar', 2)
    })
    assert.equal(1, _import('foo').from('module'))
    assert.equal(2, _import('bar').from('module'))
  })

  it('should raise on cyclic dependencies', function() {
    _import.module('moduleA').promise('foo', function moduleA(_export) {
      var bar = _import('bar').from('moduleB')
      _export('foo', bar-1)
    });
    _import.module('moduleB').promise('bar', function moduleB(_export) {
      var foo = _import('foo').from('moduleA')
      _export('bar', foo+1)
    })
    assert.throws(function() {
      assert.equal(1, _import('foo').from('moduleA'))
    }, /Circular/);
    assert.throws(function() {
      assert.equal(2, _import('bar').from('moduleB'))
    }, /Circular/);
  })

  it('should raise on cyclic dependencies within a module', function() {
    _import.module('module').promise('foo', function moduleA(_export) {
      var bar = _import('bar').from('module')
      _export('foo', bar-1)
    });
    _import.module('module').promise('bar', function moduleB(_export) {
      var foo = _import('foo').from('module')
      _export('bar', foo+1)
    })
    assert.throws(function() {
      assert.equal(1, _import('foo').from('module'))
    }, /Circular/);
    assert.throws(function() {
      assert.equal(2, _import('bar').from('module'))
    }, /Circular/);
  })
})
