'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var queryString = require('querystring');
var request = require('request');

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
          
        } else {
          res.status(400);
          res.json({message: 'No Token Provided'});
        }
        
  });

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
  
  
      request(options, handleGoogleResponse(idToken, nodeCallback)).end();
  
  }
  
  
  /**
   * 
   * This callback consumes Google's response, and performs the appropriate 
   * actions on the session. (Set session optionally creating the account).
   * 
   * @param {type} idToken
   * @param {type} nodeCallback
   * @returns session Data on callback if successful, error on callback otherwise
   */
  function handleGoogleResponse(sessionToken, nodeCallback) {
      return function (error, response, body) {
          
          //the whole response has been recieved, so we just print it out here
          if (error) {
            nodeCallback(e);
          } else {
            var resObject = JSON.parse(body);
            checkAccount(resObject, sessionToken, nodeCallback);
          }
  
      };
  }
  
  /**
   * Creates a user if one does not exist
   * 
   * @param {Object}  Google user Token response (see : https://developers.google.com/identity/sign-in/android/backend-auth#calling-the-tokeninfo-endpoint)
   * @param {Sting} sessionToken
   * @param {NodeCallback} nodeCallback
   * @returns session Data on callback if successful, error on callback otherwise
   */
  function checkAccount(googleUserToken, sessionToken, nodeCallback) {
      console.log('checkAccountAndCreateSession');
      var handleResults = function (error, responseData) {
        console.log('checkAccountAndCreateSession_callback');
          if (error) {
              return nodeCallback(error, null);
          } else {
              if (!responseData || responseData.count === 0) {
                  //no account, must create.
                  createAccount(googleUserToken, nodeCallback);
              } else if (responseData.count > 1) {
                  return nodeCallback("error : Too many accounts returned", null);
              } else {
                  //account exists, set session and return it.
                  setSession(sessionToken, responseData.list[0].fields, nodeCallback);
              }
          }
      };
  
      mbaasApi.db({
          "act": "list",
          "type": 'account',
          "eq": {"id": googleUserToken.sub},
      }, handleResults);
  }
  
  /**
   *  Creates an account and sets the session to that account.
   * @param {Object}  Google user Token response (see : https://developers.google.com/identity/sign-in/android/backend-auth#calling-the-tokeninfo-endpoint)
   * @param {NodeCallback} nodeCallback
   * @returns session Data on callback if successful, error on callback otherwise
   */
  function createAccountAndSetSession(sessionToken, authResponse, nodeCallback) {
    authResponse.authToken = '';
      mbaasApi.db({
          "act": "create",
          "type": 'account',
          "fields": [authResponse]
      }, function (error, data) {
        console.log('createAccountAndSetSession_cb');
          if (error) {
              return nodeCallback(error);
          } else {
              setSession(sessionToken, authResponse, nodeCallback);
  
          }
      });
  }

  return router;

}



module.exports = auth;
