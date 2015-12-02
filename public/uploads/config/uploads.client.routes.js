angular.module('uploads').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/uploads', {
            templateUrl: 'uploads/views/list-uploads.client.view.html'
        }).
        when('/uploads/create', {
            templateUrl: 'uploads/views/create-upload.client.view.html'
        }).
        when('/uploads/:uploadId', {
            templateUrl: 'uploads/views/view-upload.client.view.html'
        }).
        when('/uploads/:uploadId/edit', {
            templateUrl: 'uploads/views/edit-upload.client.view.html'
        });
    }
]);