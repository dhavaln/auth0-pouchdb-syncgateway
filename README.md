# PouchDB to Sync Gatway NodeJS Proxy
The demo AngularJS app is using authentication from Auth0, and then connects PouchDB to Sync Gateway using NodeJS Proxy server.

# Pre-requisite 

* Make sure you have a working account in [Auth0](https://auth0.com)
* Sync Gateway is configured with your Couchbase server
* Sync Gatway CORS Access Origin is allowed for http://localhost:8100

# Setup and Run

* npm install
* create an .env file from sample.env file and fill up the required information
* set the Auth0 config in /client/app.js
* npm start
* access the app using http://localhost:8100

