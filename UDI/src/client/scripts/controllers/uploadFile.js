'use strict';

angular
		.module('udiAs2')
		.controller(
				'UploadController',
				function($scope, $http, $location, $route, $routeParams, $modal) {

					var timestamp = new Date().getTime();
					var user = "123";

//					$scope.fileName = 
					$scope.getAuthToken = function(){

						var requeststring = user + $scope.fileName + timestamp + $scope.fileData ;
						console.log(requeststring);
				    	var hash = CryptoJS.HmacSHA256(requeststring, "Api Secret");
				    	var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
				    	console.log(hashInBase64);
				    	return hashInBase64;
					}
					
					$scope.save = function(){
						var authtoken = $scope.getAuthToken();
						
						$http(	
								{
									method: 'POST', url: 'api/fda-udi/requests/'+$scope.fileName, 
									data: $scope.fileData,
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
									alert('Data Saved success fully');
									$scope.cancel();
									
								} else {
									alert('Data not Saved ');									
								}
//					            $scope.message = 'Uploaded File...';
					        });
					};
					
					$scope.cancel = function(){
						$location.url('/');
					}
					
				});

