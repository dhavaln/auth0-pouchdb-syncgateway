
'use string';

angular
.module('authApp', [
    'auth0', 'angular-storage', 'angular-jwt', 'ngMaterial', 'ui.router', 'pouchdb', 'ngSanitize'
])
.config(function($provide, authProvider, $urlRouterProvider, $stateProvider, $httpProvider, jwtInterceptorProvider, jwtOptionsProvider){
    
    authProvider.init({
        domain: 'client.auth0.com',
        clientID: 'XXX'
    });

    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: 'client/components/home/home.html',
        controller: 'homeController as home'
    })

    function redirect($q, $injector, store, $location, $rootScope){
        return {
            responseError: function(rejection){
                if(rejection.status == 401){                    
                    $rootScope.$broadcast('logout');                    
                }

                return $q.reject(rejection);
            }
        }
    }

    function bearer($q, store){
        return {
            request: function(config){
                config.headers = config.headers || {};
                if (store.get('id_token')) {                    
                    config.headers.Authorization = 'Bearer ' + store.get('id_token');
                }
                return config || $q.when(config);
            }
        }
    }

    jwtOptionsProvider.config({ whiteListedDomains: ['localhost:3001'] });

    $provide.factory('redirectTo', redirect);
    $provide.factory('bearer', bearer);

    $httpProvider.interceptors.push('redirectTo');
    $httpProvider.interceptors.push('bearer');
    $httpProvider.interceptors.push('jwtInterceptor');
})
.run(function($rootScope, auth, store, jwtHelper, $location){
    $rootScope.$on('logout', function(){        
        auth.signout();
        store.remove('profile');
        store.remote('id_token');
        $location.path('/home');
    });

    $rootScope.$on('$locationChangeStart', function(var1, var2){
        var token = store.get('id_token');
        if(token && !jwtHelper.isTokenExpired(token)){
            if(!auth.isAuthenticated){
                auth.authenticate(store.get('profile'), token);
            }
        }else{
            $location.path('/home');
        }
    });
});