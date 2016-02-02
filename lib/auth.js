'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var queryString = require('querystring');

function auth() {
  var router = express.Router();

  router.all('/auth', function(req, res, next) {
        var params = req.body; // params.userId params.password
        if (params && params.userId && params.serverToken) {
          console.log('Checking credentials for user ' + params.userId);
          
        //   .then(function(profileData) {
        //     console.log('Valid credentials for user ' + params.userId);
        //     res.json({
        //       status: 'ok',
        //       userId: params.userId,
        //       sessionToken: params.userId + '_sessiontoken',
        //       authResponse: profileData
        //     });
        //   }, function(err) {
        //     console.log('Invalid credentials for user ' + params.userId);
        //     res.status(400);
        //     res.json({message: 'Invalid credentials'});
        //   });
        // } else {
        //   console.log('No username provided');
        //   res.status(400);
        //   res.json({message: 'Invalid credentials'});
        }
        return router;
  });


}

    /**
     * Validate the user's session info with Google, and create a session object.  
     * This will also create a account object if necessary.
     * 
     * @param {String} idToken an idToken provided by an Android Client (see : https://developers.google.com/identity/sign-in/android/backend-auth)
     * @param {Callback} nodeCallback a node callback
     */
    function initSession(idToken, nodeCallback) {
        //validate with google
        var options = {
            
            url: 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + querystring.escape(idToken),
            method: 'GET'
        };


        request(options, handleGoogleResponse(sessionToken, authResponse, nodeCallback)).end();

    }

module.exports = helloRoute;
