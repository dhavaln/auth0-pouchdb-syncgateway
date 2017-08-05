(function(){
    'use strict';

    angular
    .module('authApp') 
    .directive('toolbar', toolbar);

    function toolbar(){
        return {
            templateUrl: 'client/components/toolbar/toolbar.html',
            controller: toolbarController,
            controllerAs: 'toolbar'
        }
    }

    function toolbarController(auth, store, $location){
        var vm = this;
        vm.login = login;
        vm.logout = logout;
        vm.auth = auth;

        function login(){            
            auth.signin({}, function(profile, token){
                store.set('profile', profile);
                store.set('id_token', token);
                $location.path('/home');
            }, function(err){
                console.log(err);
                $location.path('/error');
            });
        }

        function logout(){
            store.remove('profile');
            store.remove('id_token');
            auth.signout();
            $location.path('/home');
        }
    }
})();