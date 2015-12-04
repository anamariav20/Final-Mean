// Invoke 'strict' JavaScript mode
'use strict';

// Create the 'uploads' controller
angular.module('uploads').controller('UploadController', ['$scope', '$timeout', , '$routeParams', '$upload', '$stateParams', '$location', 'Authentication', 'Uploads',
    function($scope, $timeout, $upload, $stateParams, $routeParams, $location, Authentication, Uploads) {
        $scope.fileReaderSupported = window.FileReader !== null;
        // Expose the Authentication service
        $scope.authentication = Authentication;

        // Create new upload
        $scope.create = function(picFile) {
            console.log('create');
            console.log(picFile);

            var upload = new Uploads({
                title: this.title,
                content: this.content,
                image: null
            });
            console.log(upload);
            $upload.upload({
                url: '/uploadupload',
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                fields: {
                    upload: upload
                },
                file: picFile,
            }).success(function(response, status) {
                $location.path('uploads/' + response._id);

                $scope.title = '';
                $scope.content = '';
            }).error(function(err) {
                $scope.error = err.data.message;
            });


            $scope.doTimeout = function(file) {
                console.log('do timeout');
                $timeout(function() {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(file);
                    console.log('read');
                    fileReader.onload = function(e) {
                        $timeout(function() {
                            file.dataUrl = e.target.result;
                            console.log('set url');
                        });
                    };
                });
            };


            $scope.generateThumb = function(file) {
                console.log('generate Thumb');
                if (file) {
                    console.log('not null');
                    console.log(file);
                    if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                        $scope.doTimeout(file);
                    }
                }
            };


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
                }
                else {
                    // Otherwise, use the upload '$remove' method to delete the upload
                    $scope.upload.$remove(function() {
                        $location.path('uploads');
                    });
                }
            };
        };
    }
]);