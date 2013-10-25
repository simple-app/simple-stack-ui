/**
 * Module dependencies
 */

var stack = require('simple-stack-ui');
var envs = require('envs');
var routes = require('./public/javascripts/routes');

/**
 * Expose the app
 */

var app = module.exports = stack({
  restricted: false,
  routes: routes
});

/**
 * Setup app-wide locals
 */

app.locals({
  app: 'PROJECT',
  env: {
    API_URL: '/api'
  }
});
