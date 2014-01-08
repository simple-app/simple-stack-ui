var express = require('express');

var users = [
  {name: 'bill', description: 'Cool dude'},
  {name: 'bob', description: 'Not cool'},
  {name: 'ted', description: 'Just ok'}
];

/**
 * Create a test api
 */

var api = module.exports = express();

api.use(express.bodyParser());
api.use(function(req, res, next) {
  res.set('cache-control', 'max-age=60');
  next();
});

api.get('/test-api', function(req, res) {
  res.send({
    users: link('/users', req)
  });
});

api.get('/test-api/users', function(req, res) {
  res.send({
    users: users.map(function(user) {
      return link('/users/' + user.name, req)
    }),
    create: {
      action: resolve('/users', req),
      method: 'POST',
      input: {
        name: {
          type: 'text',
          placeholder: 'Name',
          required: true
        },
        description: {
          placeholder: 'Description',
          type: 'text'
        }
      }
    }
  });
});

api.post('/test-api/users', function(req, res) {
  users.push(req.body);
  res.redirect('/test-api/users/' + req.body.name);
});

api.get('/test-api/users/:id', function(req, res) {
  var user = users.filter(function(user) {
    return user.name === req.params.id;
  })[0];

  if (!user) return res.send(404);

  res.send({
    name: req.params.id,
    description: user.description,
    update: {
      action: req.base + req.url,
      method: 'PUT',
      input: {
        description: {
          type: 'text',
          value: user.description
        }
      }
    },
    remove: {
      action: req.base + req.url,
      method: 'DELETE'
    }
  });
});

api.put('/test-api/users/:id', function(req, res) {
  users = users.map(function(user) {
    if (user.name === req.params.id) return {name: user.name, description: req.body.description};
    return user;
  });
  res.send(204);
});

api.delete('/test-api/users/:id', function(req, res) {
  users = users.filter(function(user) {
    return user.name !== req.params.id;
  });
  res.set('location', resolve('/users', req));
  res.send(204);
});

function link(link, req) {
  return {
    href: resolve(link, req)
  };
}

function resolve(link, req) {
  return (req ? req.base : '') + '/test-api' + link;
};