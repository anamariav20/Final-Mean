angular.module('uploads').factory('Uploads', ['$resource', function($resource) {
    return $resource('api/uploads/:uploadId', {
        uploadId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);