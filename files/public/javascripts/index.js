/**
 * Module dependencies
 */

module.exports = require('simple-ui')('PROJECT', [], require);

/**
 * Initialize partials
 */

app.initPartial('header');
app.initPartial('footer');
app.initPartial('sidenav');

/**
 * Start app
 */

app.start();
