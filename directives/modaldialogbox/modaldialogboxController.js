
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

Dhis2Api.directive('d2Modaldialogbox', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/modaldialogbox/modaldialogboxView.html'
	}
});

Dhis2Api.controller("d2modaldialogboxController", ['$scope','$modal', function ($scope, $modal) {
    
}]);

Dhis2Api.controller('ModalConfirmCtrl', function ($scope, $q, $modalInstance, information, OrgUnit, OrganisationUnitChildren, DataSetsOrgUnit, commonvariable) {
	$scope.information=information;

	$scope.ok = function () {

	    OrganisationUnitChildren.get({uid:$scope.information.id,fields:'name,id,dataSets'}).$promise.then(function(response){
			var targetOu = response.organisationUnits;
			var closeTargetOuPromises = targetOu.map(function (orgUnit) {
				return OrgUnit.PATCH({id: orgUnit.id}, {closedDate: $scope.closedate}).$promise;
			});

			var unassignDatasetsPromises = targetOu.map(function (orgUnit) {
				var payload = {
					"deletions": orgUnit.dataSets.map(function (ds) { return { "id": ds.id };})
				};
				return DataSetsOrgUnit.POST({"uidorgunit": orgUnit.id}, payload).$promise;
			});
			
			$q.all(closeTargetOuPromises.concat(unassignDatasetsPromises)).then(function(result) {
				console.log(result);

				commonvariable.EditOrganisationUnit = commonvariable.OrganisationUnit;
				commonvariable.EditOrganisationUnit["children"] = [];
				commonvariable.EditOrganisationUnit["closedDate"] = $scope.closedate;
				commonvariable.RefreshTreeOU = true;

				$modalInstance.close(true);
			})
		});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

    // Date datepicker
	$scope.today = function () {
		datetoday = new Date();
		$scope.closedate = datetoday.getFullYear() + "-" +
			((datetoday.getMonth() + 1) <= 9 ? "0" + (datetoday.getMonth() + 1) : (datetoday.getMonth() + 1)) + "-" +
			(datetoday.getDate() <= 9 ? "0" + datetoday.getDate() : datetoday.getDate());
	};

	$scope.today();

	$scope.clear = function () {
		$scope.closedate = null;
	};

	$scope.open = function ($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.opened = true;
	};
});