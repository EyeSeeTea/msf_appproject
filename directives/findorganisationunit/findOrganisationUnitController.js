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

Dhis2Api.directive('d2Findorganisationunit', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/findorganisationunit/findOrganisationUnitView.html',
        scope: { field: '@', placeholder: '@', value: '@', operation: '@', id: '@' }
    }
});

Dhis2Api.controller("findOrganisationUnitController", ['$scope','$http', 'OrganisationUnitFind',"commonvariable",function ($scope, $http, OrganisationUnitFind, commonvariable) {


    $scope.initValue = function () {
        $scope.mdname = "";
    };


    $scope.findOu = function () {

        OrganisationUnitFind.get({ param: $scope.field + ':eq:' + $scope.mdname })
            .$promise.then(function (data) {

                if (data.organisationUnits.length > 0) {

                    if ($scope.operation == 'edit' && $scope.value != $scope.mdname) {
                        $scope.OrganisationUnitfound = data.organisationUnits;
                        $scope.alertOu = true;
                        $scope.ouExist = 'has-error';

                        if ($scope.field == "name")
                            commonvariable.ouDirective = "";
                        else
                            commonvariable.ouDirectiveCode = "";
                    }
                    else {
                        if ($scope.operation != 'edit') {
                            $scope.OrganisationUnitfound = data.organisationUnits;
                            $scope.alertOu = true;
                            $scope.ouExist = 'has-error';
                            if ($scope.field == "name")
                                commonvariable.ouDirective = "";
                            else
                                commonvariable.ouDirectiveCode = "";
                        }                       
                    }

                } else {
                    $scope.alertOu = false;
                    if ($scope.field == "name") {
                        commonvariable.ouDirective = $scope.mdname;
                    }
                    else {
                        commonvariable.ouDirectiveCode = $scope.mdname;
                    }
                    $scope.ouExist = '';

                }
            });


    };

    $scope.$watch(function () {
        if (commonvariable.clearForm[$scope.id] == true) {
            $scope.initValue();
            commonvariable.clearForm[$scope.id] = false;
        }
         if (commonvariable.OrganisationUnit && commonvariable.OrganisationUnit.id != $scope.prevOu) {
            $scope.prevOu = commonvariable.OrganisationUnit.id;
            $scope.mdname = $scope.value;
            
        }
        //if (($scope.mdname == undefined || $scope.mdname == "") && ($scope.value != undefined || $scope.value != "")) {
           // $scope.mdname=$scope.value;
        //}

        if($scope.operation =='show'){
            $scope.mdname = $scope.value;
            $scope.alertOu = false;
            $scope.ouExist = '';
        }
        if ($scope.operation != $scope.prevOperation) {
            try {
                if ($scope.operation == 'edit')
                    $scope.isDisabled = false;
                else {
                    $scope.isDisabled = true;
                }
                    $scope.prevOperation = $scope.operation;
  

            } catch (err) {
                console.log("Error, Organisation Unnit doesn't selected");
            };
        }
    });


}]);


