angular.module('categories').factory('Categories', ['$resource', function($resource) {
    return $resource('api/categories/:categoryId', {
        categoryId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);