/**
 * Analyse a path for files with importable modules and their dependencies
 * usage: node explainTree.js ./modules-a ./modules-b
 */
var fs = require('fs')
var path = require('path')
var explainModule = require('./explainModule.js')

function uniq (memo, value) {
  if (memo.indexOf(value) > -1) return memo
  else return memo.concat([value])
}

function compat (memo, value) {
  if (value) {
    if (value.hasOwnProperty('length')) {
      if (value.length > 0) return memo.concat([value])
      else return memo
    } else {
      return memo.concat([value])
    }
  }
  else return memo
}

function flatten (memo, value) {
  if (value.constructor === Array) return memo.concat(value)
  else return memo.concat([value])
}

function glob (filePath) {
  return fs.readdirSync(filePath).map(function (fileName) {
    var fullPath = path.join(filePath, fileName)
    var stats = fs.statSync(fullPath)
    if (stats.isDirectory()) {
      return glob(fullPath)
    } else return fullPath
  }).reduce(uniq, []).reduce(compat, [])
}

function explain (filePath) {
  return glob(filePath).map(explainModule).reduce(flatten, [])
}

function findModule (modules) {
  return function (dependency) {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].promises.indexOf(dependency) > -1) return modules[i]
    }
  }
}

function times (num, str) {
  var result = ''
  for (var i = 0; i < num; i++) {
    result += str
  }
  return result
}

function titleStr (module) {
  return module.promises.join(', ')
}

function dependStr (modules, depth, stack) {
  return function (dependency) {
    var dependentModule = findModule(modules)(dependency)
    var prefix = times(depth, ' ') + '| '
    var result = [ prefix + dependency ]
    if (dependentModule) {
      if (stack.indexOf(dependentModule) > -1) {
        result.push(prefix + '[circular dependency]')
      } else {
        stack.push(dependentModule)
        result.push(dependentModule.depends.map(dependStr(modules, depth + 1, stack)).join('\n'))
        stack.pop()
      }
    } else {
      result.push(prefix + '[undefined]')
    }
    return result.reduce(compat, []).join('\n')
  }
}

function stringify (modules, depth, stack) {
  depth = depth || 0
  stack = stack || []
  return modules.map(function (module) {
    var deps = module.depends.map(dependStr(modules, depth + 1, stack))
    return [
      titleStr(module),
      deps.join('\n')
    ].reduce(compat, []).join('\n')
  }).join('\n')
}

if (process.argv[1] === __filename) {
  var args = process.argv.slice(2)
  var modules = args.map(explain).reduce(flatten, [])
  console.log(stringify(modules))
}
