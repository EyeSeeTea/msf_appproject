/* 
 Copyright (c) 2016.

 This file is part of Project Configuration for MSF.

 Project Configuration is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Project Configuration is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Project Configuration.  If not, see <http://www.gnu.org/licenses/>. */

Dhis2Api.directive('d2UserManager', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/usermanager/userManagerView.html',
        scope: {
            orgunit: '='
        }
    }
});
Dhis2Api.controller("d2UserManagerController", ['$scope', 'commonvariable', 'UserService', function ($scope, commonvariable, UserService) {
    
    //Locale information
    $scope.locales = commonvariable.locales;
    $scope.selectedLocale = "en";

    $scope.userList = [];
    
    function loadUsers () {
        UserService.getOrgUnitUsers($scope.orgunit).then(function (data) {
            $scope.userList = data.users;
        });
    }
    
    $scope.createUsers = function() {
        if($scope.onlineUsers) {
            createOnlineUsers();
        } else {
            createOfflineUsers()
        }
    };
    
    function createOfflineUsers () {
        UserService.createProjectUsers($scope.orgunit, $scope.commonUserName, $scope.selectedLocale).then(loadUsers).then(
            function success() {
                // TODO Show a success dialog
                console.log("Success");
            },
            function error() {
                console.log("ERROR: There is a problem in user creation for orgunit "
                    + $scope.orgunit.name + " (" + $scope.orgunit.id + ")");
            }
        );
    }

    function createOnlineUsers () {
        UserService.createOnlineUsers($scope.orgunit, $scope.commonUserName, $scope.selectedLocale).then(loadUsers).then(
            function success() {
                // TODO Show a success dialog
                console.log("Success");
            },
            function error() {
                console.log("ERROR: There is a problem in user creation for orgunit "
                    + $scope.orgunit.name + " (" + $scope.orgunit.id + ")");
            }
        )
    }
    
    $scope.printUserRoles = function (user) {
        return user.userCredentials.userRoles.map(function (role) {
            return role.displayName
        }).concat();
    };

    $scope.selectLocale = function (locale) {
        $scope.selectedLocale = locale;
    }
    
    loadUsers();
    
}]);