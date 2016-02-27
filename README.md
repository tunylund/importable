importable
==========

play around with ecmascript 6 module ideas within old ecma-context.

Useful mainly for transforming code from an old "namespace"-driven style to a "managed dependencies"-driven codebase.

* Does not download any assets
* Sets no expectations on what an exported thing can be
* Can be statically read for dependency graphs and other cool statistics

```
// Declare a factory that exports a thing and associate it with a module name
_import.module('module.name').promise('thing-a', 'ThingB', function (_export) {
   _export('thing-a', 42)
   _export('ThingB', function ThingB() { })
})
```

```
// Import dependencies
var thingA = _import('thing-a').from('module.name')
var ThingB = _import('ThingB').from('module.name')

// In theory, several dependencies can be imported at once, but this is useless without ecmascript 6 variable destructuring
var things = _import('thing-a', 'ThingB').from('module.name')
things[0] === thingA
things[1] === ThingB
```
