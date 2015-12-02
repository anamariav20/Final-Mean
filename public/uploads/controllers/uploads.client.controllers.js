// Invoke 'strict' JavaScript mode
'use strict';

// Create the 'uploads' controller
angular.module('uploads').controller('UploadsController', ['$scope', '$routeParams', '$location', 'Authentication', 'Uploads',
    function($scope, $routeParams, $location, Authentication, Uploads) {
    	// Expose the Authentication service
        $scope.authentication = Authentication;

        // Create a new controller method for creating new uploads
        $scope.create = function() {
        	// Use the form fields to create a new upload $resource object
            var upload = new Uploads({
                title: this.title,
                content: this.content
            });

            // Use the upload '$save' method to send an appropriate POST request
            upload.$save(function(response) {
            	// If an upload was created successfully, redirect the user to the upload's page 
                $location.path('uploads/' + response._id);
            }, function(errorResponse) {
            	// Otherwise, present the user with the error message
                $scope.error = errorResponse.data.message;
            });
        };

        // Create a new controller method for retrieving a list of uploads
        $scope.find = function() {
        	// Use the upload 'query' method to send an appropriate GET request
            $scope.uploads = Uploads.query();
        };

        // Create a new controller method for retrieving a single upload
        $scope.findOne = function() {
        	// Use the upload 'get' method to send an appropriate GET request
            $scope.upload = Uploads.get({
                uploadId: $routeParams.uploadId
            });
        };

        // Create a new controller method for updating a single upload
        $scope.update = function() {
        	// Use the upload '$update' method to send an appropriate PUT request
            $scope.upload.$update(function() {
            	// If an upload was updated successfully, redirect the user to the upload's page 
                $location.path('uploads/' + $scope.upload._id);
            }, function(errorResponse) {
            	// Otherwise, present the user with the error message
                $scope.error = errorResponse.data.message;
            });
        };

        // Create a new controller method for deleting a single upload
        $scope.delete = function(upload) {
        	// If an upload was sent to the method, delete it
            if (upload) {
            	// Use the upload '$remove' method to delete the upload
                upload.$remove(function() {
                	// Remove the upload from the uploads list
                    for (var i in $scope.uploads) {
                        if ($scope.uploads[i] === upload) {
                            $scope.uploads.splice(i, 1);
                        }
                    }
                });
            } else {
            	// Otherwise, use the upload '$remove' method to delete the upload
                $scope.upload.$remove(function() {
                    $location.path('uploads');
                });
            }
        };
    }
]);