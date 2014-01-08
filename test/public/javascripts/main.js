/**
 * Module dependencies
 */

var app = require('.');
var routes = require('./routes');
var type = require('type');

/**
 * Initialize aux partials
 */

loadPartial('header');
loadPartial('sidenav');
loadPartial('footer');

/**
 * Start the app
 */

module.exports = require('simple-ui').run(app, {
  routes: routes,
  loader: loadPartial
});

/**
 * Helper function for resolving partial paths
 *
 * @api private
 */

function loadPartial(name) {
  return require('../partials/' + name);
}


















/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

function each(obj, fn){
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
}

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(i, obj[i]);
  }
}










function merge(a, b) {
  var atype = type(a);
  var btype = type(b);

  // replace the value if not of same type
  if (atype !== btype) return b;

  // scalar
  if (atype !== 'array' && atype !== 'object') return b;

  // TODO whats the best way to not have to iterate over both?
  each(a, function(key, value) {
    a[key] = merge(value, b[key]);
  });
  each(b, function(key, value) {
    // TODO handle array deletion better
    if (type(value) === 'undefined') return delete a[key];
    a[key] = merge(a[key], value);
  });

  return a;
}

// TESTS

var person = {name: 'Mike'};
var initital = [person, {name: 'Other'}];
var merged = merge(initital, [{name: 'Cameron'}]);

console.log(merged[0] === person);
console.log(merged[0].name === 'Cameron');

console.log(merged);