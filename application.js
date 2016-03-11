var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var bodyParser = require('body-parser');


var app = express();

// Enable CORS for all requests
app.use(cors());

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys([]));
app.use('/mbaas', mbaasExpress.mbaas);

// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

app.get('/list/:googleId', function(req,res) {
  mbaasApi.db({
          "act": "list",
          "type": 'account',
          "eq":{"sub":googleId}
  }, function(err, noterr) {
    if (err) {
     res.end('Boo! ' + err);
    } else {
      res.end('OOB! ' + JSON.stringify(noterr));
    }
  });
  });


app.get('/list', function(req,res) {
  mbaasApi.db({
          "act": "list",
          "type": 'account'
  }, function(err, noterr) {
    if (err) {
     res.end('Boo! ' + err);
    } else {
      res.end('OOB! ' + JSON.stringify(noterr));
    }
  });
  });

app.get('/drop', function(req,res) {
  mbaasApi.db({
          "act": "deleteall",
          "type": 'account'
  }, function(err, noterr) {
    if (err) {
     res.end('Boo! ' + err);
    } else {
      res.end('OOB! ' + JSON.stringify(noterr));
    }
  });
  });



app.use('/hello', require('./lib/hello.js')());
app.use(bodyParser());

app.use('/auth', require('./lib/auth.js')());

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port); 
});
