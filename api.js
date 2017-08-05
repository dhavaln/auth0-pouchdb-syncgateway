const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
var uuid = require("uuid");

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file'
}

app.use('/api/*', cors({ origin: 'http://localhost:8100' }));
app.use('/api/*', bodyParser.json());
app.use('/sync/*', function(req, res, next){  

  var origin = req.headers.origin;
  console.log(origin);

  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Credentials", "true");
  
  if ('HEAD' == req.method || 'OPTIONS' == req.method) {
    res.send(200);
    return;
  }

  next();  
});

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// this is a public request and anyone can call this without any security token
app.get('/api/public', function(req, res){
    res.send({message: 'This is a public message'});
});

// this request is authenticated and will require valid Token from client
app.get('/api/private', checkJwt, function(req, res){
  // for the authenticated user the user info will be in req.user
  console.log(req.user);
  res.send({message: 'This is the SECRET PRIVATE message for ' + req.user.sub});
});

require('./sync')(app);

app.listen(3001);
console.log('Listening on http://localhost:3001');