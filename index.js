/**
 * Module dependencies
 */

var stack = require('simple-stack-common');
var envs = require('envs');
var assets = require('simple-assets');
var oauth = require('./lib/oauth');

/**
 * Forwarding headers
 */

var headers = {
  host: 'x-orig-host',
  path: 'x-orig-path',
  port: 'x-orig-port',
  proto: 'x-orig-proto'
};

/**
 * Expose the app
 */

exports = module.exports = function(opts) {
  opts = opts || {};

  var root = opts.root || process.cwd();
  var restricted = opts.restricted;
  var CDN_URL = opts.cdn || envs('CDN_URL') || '';
  var STATIC_MAX_AGE = opts.staticMaxAge || envs.int('STATIC_MAX_AGE', 0);
  var API_URL = opts.apiUrl || envs('API_URL');
  var SITE_URL = opts.siteUrl || envs('SITE_URL');
  var ENABLED_FEATURES = opts.enabledFeatures || envs('ENABLED_FEATURES') || '';
  var routes = Object.keys(opts.routes || {'/': 'index'});

  function assetLookup(file, path, useCdn) {
    return (useCdn ? CDN_URL : '') + path + '/' + assets(file);
  }

  // TODO allow adding scripts and styles

  var styles = function(min, path) {
    return [
      assetLookup(min ? 'build/build.min.css' : 'build/build.css', path, min)
    ];
  }

  var scripts = function(min, path) {
    return [
      assetLookup(min ? 'build/build.min.js' : 'build/build.js', path, min)
    ];
  }

  /**
   * Create an app
   */

  var app = stack({
    base: headers
  });

  /**
   * Use jade as the default view engine
   */

  app.set('view engine', 'jade');

  /**
   * Extra middleware
   */

  app.useBefore('router', stack.middleware.cookieParser());

  /**
   * Serve the static assets
   */

  app.useBefore('router', '/build', 'build', stack.middleware.static(root + '/build', {
    maxAge: STATIC_MAX_AGE
  }));

  app.useBefore('router', '/build', function buildNotFound(req, res) {
    res.send(404);
  });

  app.useBefore('router', function assetLocals(req, res, next) {
    var min = req.get('x-env') === 'production';
    var path = req.get('x-orig-path') || '';

    res.locals({
      styles: styles(min, path),
      scripts: scripts(min, path)
    });
    next();
  });

  app.configure('development', function() {
    if (!API_URL) return;
    // Proxy the api
    var proxy = require('simple-http-proxy');
    app.useBefore('base', '/api', 'api-proxy', proxy(API_URL, {xforward: headers}));
  });

  /**
   * Use authentication middleware
   */

  var auth = oauth(opts.auth);
  app.useBefore('router', '/auth/login', 'auth:login', auth.login());
  app.useBefore('router', '/auth/register', 'auth:register', auth.login({register: 1}));
  app.useBefore('router', '/auth/callback', 'auth:callback', auth.login());
  app.useBefore('router', '/auth/logout', 'auth:logout', auth.logout());
  app.useBefore('router', '/auth', 'auth:root-redirect', function(req, res) {
    res.redirect(req.base);
  });

  /**
   * Serve feature flags
   */

  var features = '';
  try {
    features = require(root + '/features.json').join(',');
  } catch (e) {};

  app.get('/features.json', function(req, res) {
    if (features === '') return res.send([]);
    res.send(features.split(','));
  });

  app.useBefore('router', '/', 'features', function(req, res, next) {
    var featuresList = req.get('x-env') === 'production'
      ? ENABLED_FEATURES
      : features;

    if (featuresList !== req.cookies.features) res.cookie('features', featuresList);

    next();
  });

  /**
   * Remove the middleware we don't need
   */

  app.remove('methodOverride');
  app.remove('bodyParser');

  /**
   * Index
   */

  function index(req, res, next){
    // If we don't have the site url set, get it from the header or env
    if (!res.locals.site) res.locals.site = req.get('x-ui-url') || SITE_URL || req.base;

    auth.authenticate(restricted)(req, res, function(err) {
      if (err) return next(err);

      // TODO send dns-prefetch the api and cdn

      res.render(app.get('index view') || 'index');
    });
  };

  /**
   * Mount the routes
   */

  routes.forEach(function(route) {
    app.get(route, index);
  });

  return app;
};

/**
 * Expose the middleware
 */

stack.middleware(exports.middleware = {});
