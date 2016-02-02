'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

function auth() {
  var router = express.Router();

  router.all('/auth', function(req, res, next) {
        var params = req.body; // params.userId params.password
        if (params && params.userId && params.serverToken) {
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
        return router;
  });


}

    /**
     * Validate the user's session info with Google, and create a session object.  
     * This will also create a account object if necessary.
     * 
     * @param {String} sessionToken session token returned by the OAuth mbaas
     * @param {Object} authResponse authResponse returned by Google
     * @param {Callback} nodeCallback a node callback
     */
    function initSession(sessionToken, authResponse, nodeCallback) {
        //validate with google
        var options = {
            
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + authResponse.authToken}
        };


        request(options, handleGoogleResponse(sessionToken, authResponse, nodeCallback)).end();

    }

module.exports = helloRoute;
