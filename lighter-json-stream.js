/**
 * Listen to a stream's data, and emit events like "object" and "string".
 */

var vm = require('vm')

/**
 * Get lines from a stream, and fire events when they are parsed.
 */
JSON.readStream = function (stream, event) {
  var data = ''
  stream.on('data', function (chunk) {
    data += chunk
    var end = data.indexOf('\n')
    while (end > 0) {
      var line = data.substr(0, end)
      data = data.substr(end + 1)
      var object = evaluate(line)
      var error = evaluate.error
      if (error) {
        stream.emit('error', error)
      } else {
        stream.emit(event || (typeof object), object)
      }
      end = data.indexOf('\n')
    }
  })
  return stream
}

/**
 * Evaluate a piece of JavaScript code.
 *
 * @param  {String} js  A snippet of JavaScript code.
 * @return {Any}        The value of that snippet.
 */
function evaluate (js) {
  try {
    var context = {}
    vm.runInNewContext('var o = ' + js, context)
    return context.o
  } catch (e) {
    e.message += '\n' + js + '\n' + (e instanceof SyntaxError)
    throw e
  }
}
