/**
 * Module dependencies
 */

var nghtml = require('nghtml');
var jade = require('jade');

module.exports = function(name) {
  return nghtml({
    webroot: 'public',
    module: name,
    extension: '.jade',
    confProp: 'angular-templates',
    hook: function (content) {
      var compile = jade.compile(content);
      return compile();
    }
  });
};
