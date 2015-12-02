// Invoke 'strict' JavaScript mode
'use strict';

// Create the 'categories' controller
angular.module('categories').controller('CategoriesController', ['$scope', '$routeParams', '$location', 'Authentication', 'Categories',
    function($scope, $routeParams, $location, Authentication, Categories) {
    	// Expose the Authentication service
        $scope.authentication = Authentication;

        // Create a new controller method for creating new categories
        $scope.create = function() {
        	// Use the form fields to create a new category $resource object
            var category = new Categories({
                title: this.title,
                content: this.content
            });

            // Use the category '$save' method to send an appropriate POST request
            category.$save(function(response) {
            	// If an category was created successfully, redirect the user to the category's page 
                $location.path('categories/' + response._id);
            }, function(errorResponse) {
            	// Otherwise, present the user with the error message
                $scope.error = errorResponse.data.message;
            });
        };

        // Create a new controller method for retrieving a list of categories
        $scope.find = function() {
        	// Use the category 'query' method to send an appropriate GET request
            $scope.categories = Categories.query();
        };

        // Create a new controller method for retrieving a single category
        $scope.findOne = function() {
        	// Use the category 'get' method to send an appropriate GET request
            $scope.category = Categories.get({
                categoryId: $routeParams.categoryId
            });
        };

        // Create a new controller method for updating a single category
        $scope.update = function() {
        	// Use the category '$update' method to send an appropriate PUT request
            $scope.category.$update(function() {
            	// If an category was updated successfully, redirect the user to the category's page 
                $location.path('categories/' + $scope.category._id);
            }, function(errorResponse) {
            	// Otherwise, present the user with the error message
                $scope.error = errorResponse.data.message;
            });
        };

        // Create a new controller method for deleting a single category
        $scope.delete = function(category) {
        	// If an category was sent to the method, delete it
            if (category) {
            	// Use the category '$remove' method to delete the category
                category.$remove(function() {
                	// Remove the category from the categories list
                    for (var i in $scope.categories) {
                        if ($scope.categories[i] === category) {
                            $scope.categories.splice(i, 1);
                        }
                    }
                });
            } else {
            	// Otherwise, use the category '$remove' method to delete the category
                $scope.category.$remove(function() {
                    $location.path('categories');
                });
            }
        };
    }
]);