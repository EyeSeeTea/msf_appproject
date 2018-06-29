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

Dhis2Api.directive('d2Resourcejsondataset', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/resourcesjsonDataset/resourcesjsondatasetView.html'
	}
});

Dhis2Api.controller("d2ResourcejsondatasetController",
    ['$scope', '$filter', "commonvariable", "DataSetsOrgUnit", "commonService", "DatasetService",
    function ($scope, $filter, commonvariable, DataSetsOrgUnit, commonService, DatasetService) {

        $scope.messages = [];
        $scope.prevOu = undefined;
        var $translate = $filter('translate');

        $scope.levels = [];
        var serviceDataSets = [];

        $scope.initForm = function () {
            $scope.style = [];
            $scope.datasetIdSelected = [];
            $scope.operation = 'show';
            $scope.prevOu = undefined;
        };

        $scope.editOrgUnit = function (datasets) {
            try {
                commonvariable.OrganisationUnit.dataSets = datasets;
            }catch(err){
                commonvariable.OrganisationUnit.dataSets = [];
                commonvariable.OrganisationUnit.dataSets = datasets;
            }
            commonvariable.EditOrganisationUnit = commonvariable.OrganisationUnit;
            $scope.pdatasets = commonvariable.OrganisationUnit.dataSets;
            //refresh tree for show change
            commonvariable.RefreshTreeOU = true;
        };

        $scope.$watch(function () {
            if ((commonvariable.OrganisationUnit && commonvariable.OrganisationUnit.id != $scope.prevOu) ||
                    commonvariable.refreshDataSets) {
                $scope.initForm();
                $scope.prevOu = commonvariable.OrganisationUnit.id;
                $scope.pdatasets = commonvariable.OrganisationUnit.dataSets;
                $scope.loadDataSet();
                commonvariable.refreshDataSets = false;
            }
        });


        $scope.showEdit = function () {
            $scope.operation = 'edit';
            $scope.loadLevels();
        };

        $scope.editHealtServiceDataset = function () {
            var dataSetsToAdd = serviceDataSets
                .filter(function (ds) { return $scope.datasetIdSelected.indexOf(ds.id) > -1});
            var dataSetsToRemove = serviceDataSets
                .filter(function (ds) { return $scope.datasetIdSelected.indexOf(ds.id) <= -1});

            var payload = {
                "additions": dataSetsToAdd.map(function (ds) { return { "id": ds.id };}),
                "deletions": dataSetsToRemove.map(function (ds) { return { "id": ds.id };})
            };
            DataSetsOrgUnit.POST({"uidorgunit": commonvariable.OrganisationUnit.id}, payload).$promise.then(function (data) {
                $scope.editOrgUnit(dataSetsToAdd);
                $scope.initForm();
            });
        };

        $scope.loadLevels = function () {
            commonvariable.healhservicesCodeOUG = commonvariable.healhservicesCodeOUG.trim();
            DatasetService.getByService(commonvariable.healhservicesCodeOUG)
                .then(saveDataSets);
        };
        
        function saveDataSets (dataSetByLevels) {
            $scope.levels = dataSetByLevels.levels;
            $scope.levels = commonService.sortByKey($scope.levels, 'value');
            serviceDataSets = $scope.levels
                .reduce(function (array, level) {
                    return array.concat(level.periods.reduce(function (periods, period) {
                        return periods.concat(period.dataSets);
                    }, []));
                }, []);
        }

        $scope.loadDataSet = function () {
            angular.forEach($scope.pdatasets, function (dataSet, key) {
                $scope.selectDataSet(dataSet.id);
            });
        };

        $scope.selectDataSet = function(dsId) {
            var index = $scope.datasetIdSelected.indexOf(dsId);
            if (index > -1) {
                $scope.datasetIdSelected.splice(index, 1);
                $scope.style[dsId] = '';
            }
            else {
                $scope.style[dsId] = "success";
                $scope.datasetIdSelected.push(dsId);
            }
        };

        //set message variable
        $scope.closeAlertMessage = function (index) {
            $scope.messages.splice(index, 1);
        };

        $scope.showAllDatasets = function () {
            DatasetService.getAllDataSets()
                .then(saveDataSets);
        };

   }]);

