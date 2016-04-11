'use strict';

angular.module('udiAs2',['ngCookies',
                                    'ngResource',
                                    'ngRoute',
                                    'ngSanitize',
                                    'utf8-base64',
                                    'ui.bootstrap'])
.config(function($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl : 'views/udiAs2.html',
            controller  : 'UdiAs2Controller'
        })

        .when('/uploadFile', {
            templateUrl : 'views/uploadFile.html',
            controller  : 'UploadController'
        })
        
        .when('/downloadFile', {
            templateUrl : 'views/uploadFile.html',
            controller  : 'DownloadController'
        })
        
        .when('/retrieveList', {
            templateUrl : 'views/retrieveList.html',
            controller  : 'RetrieveListController'
        })
                .when('/error', {
        	templateUrl : 'error.html',
        	controller  : 'RetrieveListController'
        })
        .otherwise({
            redirectTo  : '/error'
        })

});
