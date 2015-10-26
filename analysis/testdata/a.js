_import.module('aa').promise('A', function (_export) {

  var foo = _import('foo').from('bar')
  _import('bar').from('bar')

})

_import.module('bb').promise('B', 'C', function (_export) {

  var foo = _import('D').from('aa')
  
})
