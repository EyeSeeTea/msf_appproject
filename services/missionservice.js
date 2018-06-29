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

Dhis2Api.service('missionService', ['$q', 'commonvariable', 'User', 'OrgUnitGroupsOrgUnit', 'OrgUnit', 'FilterResource', 'DataSetsOrgUnit', 'DemographicService',
                                    function ($q, commonvariable, User, OrgUnitGroupsOrgUnit, OrgUnit, FilterResource, DataSetsOrgUnit, DemographicService) {

    this.initValue = function ($scope) { 
        $scope.projectTypeId = commonvariable.ouGroupsetId.ProjectType;
        $scope.populationTypeId = commonvariable.ouGroupsetId.PopulationType;
        $scope.typeManagementId = commonvariable.ouGroupsetId.TypeManagement;
        $scope.gsEventId = commonvariable.ouGroupsetId.Event;
        $scope.gsContextId = commonvariable.ouGroupsetId.Context;
    };
	
	this.saveProject = function (newOu) {
		
		var deferred = $q.defer();
	    
		OrgUnit.POST({},newOu).$promise.then(function(data){
			if (data.status = "OK") {
				newOu.id = data.response.uid;
				commonvariable.NewOrganisationUnit = newOu;
				 
				if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType] != undefined)
				  OrgUnitGroupsOrgUnit.POST({uidgroup:commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType].id, uidorgunit:newOu.id});
				if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType] != undefined)
				  OrgUnitGroupsOrgUnit.POST({ uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType].id, uidorgunit: newOu.id });
				if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement] != undefined)
				  OrgUnitGroupsOrgUnit.POST({ uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement].id, uidorgunit: newOu.id });
				if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event] != undefined)
				  OrgUnitGroupsOrgUnit.POST({ uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event].id, uidorgunit: newOu.id });
				if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context] != undefined)
				  OrgUnitGroupsOrgUnit.POST({ uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context].id, uidorgunit: newOu.id });


				//We don't use vaccination DataSet yet
				/**
				FilterResource.GET({resource:'dataSets', filter:'code:eq:'+commonvariable.codedatasets.codeDSVacStaff}).$promise
					.then(function(response){
						if (response.dataSets.length > 0) {
							var dataSet = response.dataSets[0];
							DataSetsOrgUnit.POST({uidorgunit:newOu.id, uiddataset:dataSet.id});
						}
					});
				 */

				DemographicService.assignDemographicInfoDataSet(newOu.id).then(function () {
					return DemographicService.assignPopulationDataSet(newOu.id);
				}).then(
					success => deferred.resolve(newOu),
					error => deferred.reject('DEMOGRAPHICS NOT ASSIGNED')
				);
			}
			else {
				deferred.reject('PROJECT NOT SAVED');
			}
		});		
		
		return deferred.promise;
	};

}]);