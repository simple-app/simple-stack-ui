/**
 * Module dependencies
 */

var stack = require('..');
var api = require('./api');

process.env.OAUTH_CLIENT_ID = 'test';
process.env.OAUTH_CLIENT_SECRET = 'test';

var app = module.exports = stack({
  root: __dirname
});

app.set('views', __dirname + '/views');

/**
 * Setup app-wide locals
 */

app.env('API_URL', '/test-api');

app.useBefore('router', '/', api);
