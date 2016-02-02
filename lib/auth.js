'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var queryString = require('querystring');

function auth() {
  var router = express.Router();

  router.all('/init', function(req, res) {
        var params = req.body; // params.userId params.password
        if (params && params.idToken) {
          console.log('Checking credentials for user ' + params.idToken);
          initSession(idToken, function(err, result){
            if (err) {
              console.log('Invalid credentials for user ' + params.idToken);
              res.status(400);
              res.json({message: 'Invalid credentials'});
              return;
            } else {
              res.json({
                status: 'ok',
                userId: params.idToken,
                sessionToken: params.idToken + '_sessiontoken',
                authResponse: result
              });
              return;
            }
          });
          
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

module.exports = auth;
