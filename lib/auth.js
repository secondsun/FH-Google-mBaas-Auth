var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mbaasApi = require('fh-mbaas-api');
var mbaasExpress = mbaasApi.mbaasExpress();
var queryString = require('querystring');
var request = require('request');

function auth() {
  var router = express.Router();

  router.all('/init', function(req, res) {
        var params = req.body; // params.userId params.password
        if (params && params.userId) {
          console.log('Checking credentials for user ' + params.userId);
          initSession(params.userId, function(err, result){
            if (err) {
              console.log('Invalid credentials for user ' + params.userId);
              res.status(400);
              res.json({message: 'Invalid credentials'});
              return;
            } else {
              res.json({
                status: 'ok',
                userId: result,
                sessionToken: params.userId + '_sessiontoken',
                authResponse: result
              });
              return;
            }
          });
          
        } else {
          res.status(400);
          res.json({message: params.userId});
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
          
          url: 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + (idToken),
          method: 'GET'
      };
  
      var createSession = function(err, googleId) {
        if (err) {
          nodeCallback(edd, null);
        } else {
          mbaasApi.db({
            "act": "create",
            "type": 'accountSession',
            "fields": {"accountId": googleId, "session":idToken}
          }, function(err, ignore) {
            if (err){
              nodeCallback(err, null);    
            } else {
              nodeCallback(null, googleId);    
            }
          });
        }
      }
  
      request(options, handleGoogleResponse(idToken, nodeCallback)).end();
  
  }
  
  
  /**
   * 
   * This callback consumes Google's response, and performs the appropriate 
   * actions on the session. (Set session optionally creating the account).
   * 
   * @param {type} idToken an idToken received from Android
   * @param {type} nodeCallback
   * @returns session Data on callback if successful, error on callback otherwise
   */
  function handleGoogleResponse(idToken, nodeCallback) {
      return function (error, response, body) {
          
          //the whole response has been recieved, so we just print it out here
          if (error) {
           nodeCallback(e);
          } else {
            var resObject = JSON.parse(body);
            if (resObject.error_description) {
              nodeCallback(resObject.error_description, null);
            } else {
              checkAccount(resObject, idToken, nodeCallback);
            }
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
            console.log('checkAccount:Error' + JSON.stringify(error));
              nodeCallback(error, null);
          } else {
              if (!responseData || responseData.count === 0) {
                  //no account, must create.
                  console.log('create account ' + JSON.stringify(googleUserToken) );
                  createAccount(googleUserToken, nodeCallback);
              } else if (responseData.count > 1) {
                  nodeCallback("error : Too many accounts returned", null);
              } else {
                console.log('found ' + JSON.stringify(responseData) );
                  nodeCallback(null, googleUserToken.sub);
              }
          }
      };
  
      mbaasApi.db({
          "act": "list",
          "type": 'account',
          "eq": {"sub": googleUserToken.sub},
      }, handleResults);
  }
  
  /**
   *  Creates an account and sets the session to that account.
   * @param {Object}  Google user Token response (see : https://developers.google.com/identity/sign-in/android/backend-auth#calling-the-tokeninfo-endpoint)
   * @param {NodeCallback} nodeCallback
   * @returns session Data on callback if successful, error on callback otherwise
   */
  function createAccount(googleUserToken, nodeCallback) {
    
      mbaasApi.db({
          "act": "create",
          "type": 'account',
          "fields": googleUserToken
      }, function (error, data) {
          if (error) {
            console.log('createAccountAndSetSession_cb_error + ' + error);
               nodeCallback(error);
          } else {
            console.log('createAccountAndSetSession_cb_created + ' + JSON.stringify(data));
               nodeCallback(null, googleUserToken.sub);
          }
      });
  }

  return router;

}



module.exports = auth;
