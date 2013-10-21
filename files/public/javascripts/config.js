/**
 * Module dependencies
 */

var app = require('.');
var routes = require('./routes');

module.exports = require('simple-ui').run(app, {
  routes: routes
});
