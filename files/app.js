/**
 * Module dependencies
 */

var stack = require('simple-stack-ui');
var envs = require('envs');

var app = module.exports = stack({
  restricted: false,
  routes: require('./public/javascripts/routes')
});

app.locals({
  env: {
    API_URL: '/api'
  }
});
