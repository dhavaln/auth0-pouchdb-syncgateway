
const request = require('request').defaults({json: true});
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

const SG_ADMIN_URL = process.env.SG_ADMIN_URL;
const SG_USER_URL = process.env.SG_USER_URL;

const checkJwt = jwt({  
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

var sync = function(app){	
    console.log('Initializing Sync Proxy');

	app.get('/sync/_signin/:user', checkJwt, function (req, res) {		
		var sessionRequest = function (name, callback) {
			return request({
				method: 'POST',
				url: SG_ADMIN_URL + '/_session',
				json: true,
				body: {
					name: name
				}
			}, callback);
		};		

        var name = req.params.user;

		request	
		.get(SG_ADMIN_URL + '/_user/' + name)
		.on('response', function (userExistsResponse) {			
		  if (userExistsResponse.statusCode === 404) {
		  	res.send({
		  		success: false,
		  		message: 'User does not exist'
		  	})	    
		  }else{			
				sessionRequest(name, function (sessionError, sessionResponse, body) {					
					res.cookie(body.cookie_name , body.session_id, {expire : body.expires});
					res.send(body);
				});
		  }	  
		});
	});
	
	// This is to route all the Sync Gateway requests to server
	app.all('/sync/*', 
		//checkJwt, 			//TODO: validate the JWT before redirecting the request to SG
		function (req, res) {
		var url = SG_USER_URL + req.url.replace('/sync', '');
	  	req.pipe(request(url)).pipe(res);
	});
}

module.exports = sync;