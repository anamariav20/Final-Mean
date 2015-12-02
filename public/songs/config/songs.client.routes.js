angular.module('songs').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/songs', {
            templateUrl: 'songs/views/list-song.client.view.html'
        }).
        when('/songs/create', {
            templateUrl: 'songs/views/create-song.client.view.html'
        }).
        when('/songs/:songId', {
            templateUrl: 'songs/views/view-song.client.view.html'
        }).
        when('/songs/:songId/edit', {
            templateUrl: 'songs/views/edit-song.client.view.html'
        });
    }
]);