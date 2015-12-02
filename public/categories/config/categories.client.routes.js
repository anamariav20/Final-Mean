angular.module('categories').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/categories', {
            templateUrl: 'categories/views/list-categories.client.view.html'
        }).
        when('/categories/create', {
            templateUrl: 'categories/views/create-category.client.view.html'
        }).
        when('/categories/:categoryId', {
            templateUrl: 'categories/views/view-category.client.view.html'
        }).
        when('/categories/:categoryId/edit', {
            templateUrl: 'categories/views/edit-category.client.view.html'
        });
    }
]);