(function(){
    'use strict';

    angular
    .module('authApp')
    .controller('homeController', homeController)

    function homeController($http, pouchDB, store){
        var vm = this;        
        vm.public = publicAPI;
        vm.private = privateAPI;
        vm.pouchdbConnect = pouchdbConnect;

        vm.message = "";
        vm.pouchdb_log = "";

        var API_URL = 'http://localhost:3001/';

        function publicAPI(){
            vm.message = "";

            $http.get(API_URL + "api/public")
            .then(function(res){
                vm.message = res.data.message;
            })
            .catch(function(err){
                vm.message = "Error: " + err;
            });
        }

        function privateAPI(){
            vm.message = "";

            $http.get(API_URL + "api/private")
            .then(function(res){
                vm.message = res.data.message;
            })
            .catch(function(err){
                vm.message = "Error: " + err;
            });           
        }

        function createCookie(name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            } else {
                expires = "";
            }
            document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
        }

        function pouchdbConnect(){
            var localDb = pouchDB('localdb',{
            auto_compaction:true,
            revs_limit: 10
            });        

            localDb.setMaxListeners(60);

            var user = store.get('profile');

            return $http.get(API_URL + 'sync/_signin/' + user.email)
            .then(function(res){
                var data = res.data;
                if(data.status === false){
                    vm.message = data.message;
                }else{
                    createCookie(data.cookie_name, data.session_id, 1);

                    // Create PouchDB Remote Connection and pass Authorization Header with Auth0 Token
                    var remoteDb =  new PouchDB(API_URL + 'sync/sync_gateway', {
                        // ajax: {
                        //     headers: {
                        //     'Authorization': 'Bearer ' + store.get('id_token')
                        //     }
                        // },
                        auto_compaction: true, skip_setup: true
                    });

                    var sync = localDb.sync(remoteDb,{
                        live: true,
                        retry: true
                    });

                    sync.on('active', function () {
                        vm.pouchdb_log += "<br>PouchDB Sync is Active";
                        console.log('PouchDB Sync is Active');
                    });

                    sync.on('paused', function (err) {
                        vm.pouchdb_log += "<br>PouchDB Sync is Paused";
                        console.log('PouchDB Sync is Paused');
                    });

                    sync.on('complete', function (info) {
                        vm.pouchdb_log += "<br>PouchDB Sync is Complete";
                        console.log('PouchDB Sync is Complete');
                    });

                    sync.on('denied', function (err) {
                        vm.pouchdb_log += "<br>PouchDB Sync is Denied";
                        console.log('PouchDB Sync is denied');
                    });

                    sync.on('error', function (err) {
                        vm.pouchdb_log += "<br>PouchDB Sync has Error: " + err;
                        console.log('PouchDB Sync has errors', err);
                    });
                }                
            });
        }
    }
})();