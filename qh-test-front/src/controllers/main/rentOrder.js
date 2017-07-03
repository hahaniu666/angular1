(function () {
    "use strict";
    angular.module('qh-test-front')
        .config(['$stateProvider', function ($stateProvider) {

            /**
             * 我的订单
             */
            $stateProvider.state("main.rentOrder", {
                url: '/rentOrder?status&s',
                resolve: {
                    curUser: ['userService', function (userService) {
                        return userService.getCurUser(true, true);
                    }]
                },
                abstract: true
            });

        }]);

})();