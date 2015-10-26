/**
 * Analyse a file for importable modules and their dependencies
 * usage: node explainModule.js foobar.js
 */
var fs = require('fs')

function compact (memo, value) {
  if (value) return memo.concat([value])
  else return memo
}

function definitions (str) {
  return str.split('_import.module(').map(function (moduleStr) {
    return moduleStr && moduleStr.indexOf('promise') > -1 ? '_import.module(' + moduleStr : null
  }).reduce(compact, [])
}

function moduleName (str) {
  return str.match(/_import\.module\(['"](.*)['"]\)/)[1]
}

function promises (str) {
  return str.replace(/\n/g, '').match(/_import\.module\(.*\)\.promise\(([^{]*),\s+function/)[1]
    .split(',')
    .map(function (promise) {
      return promise.replace(/\s/, '').replace(/^["']/, '').replace(/["']$/, '')
    })
}

function depends (str) {
  var match = str.match(/_import\(['"](.*)['"]\)\.from\(['"](.*)['"]\)/g)
  return match ? match.map(function (_import) {
    return _import.match(/_import\(['"](.*)['"]\)\.from\(['"](.*)['"]\)/)
      .slice(1, 3)
      .reverse()
      .join('.')
  }) : []
}

function explain (filePath) {
  var data = fs.readFileSync(filePath, 'utf8')
  var defs = definitions(data)

  return defs.map(function (module) {
    return {
      fileName: filePath,
      moduleName: moduleName(module),
      promises: promises(module).map(function (promise) {
        return [moduleName(module), promise].join('.')
      }),
      depends: depends(module)
    }
  })

}

module.exports = explain

if (process.argv[1] === __filename) {
  var args = process.argv.slice(2)
  var filePath = args[0]
  console.log(explain(filePath))
}
