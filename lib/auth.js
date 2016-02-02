'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

function helloRoute() {
  var router = express.Router();

  router.all('/auth', function(req, res, next) {
    var params = req.body; // params.userId params.password
    if (params && params.userId && params.password) {
      console.log('Checking credentials for user ' + params.userId);
      mediator.request('user:username:load', params.userId)
      .then(function(profileData) {
        console.log('Valid credentials for user ' + params.userId);
        res.json({
          status: 'ok',
          userId: params.userId,
          sessionToken: params.userId + '_sessiontoken',
          authResponse: profileData
        });
      }, function(err) {
        console.log('Invalid credentials for user ' + params.userId);
        res.status(400);
        res.json({message: 'Invalid credentials'});
      });
    } else {
      console.log('No username provided');
      res.status(400);
      res.json({message: 'Invalid credentials'});
    };
  });
    return router;

}

module.exports = helloRoute;
