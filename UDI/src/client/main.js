angular.module('fileUpload', ['ngFileUpload'])
.controller('MyCtrl',['Upload','$http', '$window','$scope',function(Upload, $http, $window, $scope){
	
	$http.post('/download').success(
	function(data) {
		$scope.fileList = data;
	});
    var vm = this;
    vm.submit = function(){ //function to call on form submit
        if (vm.upload_form.fileName.$valid && vm.fileName) { //check if from is valid
            vm.upload(vm.fileName); //call upload function
        } else {
        	$window.alert('No valid file is attached');
        }
    }
    
    vm.upload = function (file) {
    	var d = new Date();
    	var url = '/upload/'+file.name+'/lpatan/?timestamp='+d.getTime()+'&token=';
        Upload.upload({
            url: url, //webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if(resp.data.error_code === 0){ //validate success
                $window.alert('Success ' + resp.config.data.file.name + ' uploaded. Response: ');
                $http.get('/download').success(
                		function(data) {
                			$scope.fileList = data;
                			console.log($scope.fileList);
                		});
            } else {
            	$window.alert('Error status: '+resp.data.err_desc);
            }
        }, function (resp) { //catch error
            $window.alert('Error status: ' + resp.status + ', Message: ' +resp.data);
            
        });
    };
}]);