// Invoke 'strict' JavaScript mode
'use strict';

// Create the 'songs' controller
angular.module('songs').controller('SongsController', ['$scope', '$routeParams', '$location', 'Authentication', 'Songs',
    function($scope, $routeParams, $location, Authentication, Songs) {
    	// Expose the Authentication service
        $scope.authentication = Authentication;

        // Create a new controller method for creating new songs
        $scope.create = function() {
        	// Use the form fields to create a new song $resource object
            var song = new Songs({
                title: this.title,
                content: this.content
            });

            // Use the song '$save' method to send an appropriate POST request
            song.$save(function(response) {
            	// If an song was created successfully, redirect the user to the song's page 
                $location.path('songs/' + response._id);
            }, function(errorResponse) {
            	// Otherwise, present the user with the error message
                $scope.error = errorResponse.data.message;
            });
        };

        // Create a new controller method for retrieving a list of songs
        $scope.find = function() {
        	// Use the song 'query' method to send an appropriate GET request
            $scope.songs = Songs.query();
        };

        // Create a new controller method for retrieving a single song
        $scope.findOne = function() {
        	// Use the song 'get' method to send an appropriate GET request
            $scope.song = Songs.get({
                songId: $routeParams.songId
            });
        };

        // Create a new controller method for updating a single song
        $scope.update = function() {
        	// Use the song '$update' method to send an appropriate PUT request
            $scope.song.$update(function() {
            	// If an song was updated successfully, redirect the user to the song's page 
                $location.path('songs/' + $scope.song._id);
            }, function(errorResponse) {
            	// Otherwise, present the user with the error message
                $scope.error = errorResponse.data.message;
            });
        };

        // Create a new controller method for deleting a single song
        $scope.delete = function(song) {
        	// If an song was sent to the method, delete it
            if (song) {
            	// Use the song '$remove' method to delete the song
                song.$remove(function() {
                	// Remove the song from the songs list
                    for (var i in $scope.songs) {
                        if ($scope.songs[i] === song) {
                            $scope.songs.splice(i, 1);
                        }
                    }
                });
            } else {
            	// Otherwise, use the song '$remove' method to delete the song
                $scope.song.$remove(function() {
                    $location.path('songs');
                });
            }
        };
    }
]);