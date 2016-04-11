'use strict';

angular
		.module('udiAs2')
		.controller(
				'RetrieveListController',
				function($scope, $http, $location, $route, $routeParams, $modal) {

					var timestamp = new Date().getTime();
					var user = "123";

//					$scope.fileName = 
					$scope.getAuthToken = function(){
						var requeststring = user + timestamp;
						console.log(requeststring);
				    	var hash = CryptoJS.HmacSHA256(requeststring, "Api Secret");
				    	var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
				    	console.log(hashInBase64);
				    	return hashInBase64;
					}
					
					$http(	
							{
								method: 'GET', url: 'api/fda-udi/responses/', 
								headers: {
											'x-as2-userid': user,
											'x-as2-timestamp': timestamp,
											'x-as2-auth-token': $scope.getAuthToken(),
											'x-as2-message-id': 12345,
											'content-type' : 'application/xml'
										 }
							}
						).success(function(data, status) {
							console.log(data);
							if(data.Code == 200){
								$scope.fileList = data.Content.responses;
								
							}
//				            $scope.message = 'Uploaded File...';
				        });
					
					$scope.fileList = [];

					$scope.download = function(filename){
						var authtoken = $scope.getAuthToken();
						$http(	
								{
									method: 'GET', url: 'api/fda-udi/responses/'+filename, 
									headers: {
												'x-as2-userid': user,
												'x-as2-timestamp': timestamp,
												'x-as2-auth-token': authtoken,
												'x-as2-message-id': 12345,
												'content-type' : 'application/xml'
											 }
								}
							).success(function(data, status) {
								console.log(data);
								if(data.Code == 200){
									$scope.fileContent = data.Content.content;
									var anchor = angular.element('<a/>');
								     anchor.attr({
								         href: 'data:attachment/xml;charset=utf-8,' + encodeURI(data.Content.content),
								         target: '_blank',
								         download: filename
								     })[0].click();
								}
					        });
					};
					
					$scope.cancel = function(){
						$location.url('/');
					}
					
				});

