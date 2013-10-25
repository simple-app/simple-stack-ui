/**
 * Module dependencies
 */

var nghtml = require('nghtml');
var jade = require('jade');
var cheerio = require('cheerio');
var write = require('fs').writeFile;

var name = require(process.cwd() + '/component.json').name;

module.exports = function(builder) {
  var features = [];

  nghtml({
    webroot: 'public',
    module: name,
    extension: '.jade',
    confProp: 'angular-templates',
    hook: function (content) {
      var out = jade.compile(content)();
      return out;

      // TODO
      var $ = cheerio.load(out);
      $('[data-feature]').each(function(i, elem) {
        features.push(elem.data.feature);
      });
      return out;
    }
  })(builder);

  // TODO
  // builder.hook('before scripts', function(pkg) {
  //   if (pkg.config.name !== name) return;
  //   write(process.cwd() + '/features.json', JSON.stringify(features), function(err) {
  //     if (err) console.error(err);
  //   });
  // });
};
