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

Dhis2Api.service('missionService', ['$q', 'commonvariable', 'User', 'OrgUnitGroupsOrgUnit', 'OrgUnit', 'FilterResource', 'DataSetsOrgUnit',
                                    function ($q, commonvariable, User, OrgUnitGroupsOrgUnit, OrgUnit, FilterResource, DataSetsOrgUnit) {

    this.initValue = function ($scope) { 
        $scope.projectTypeId = commonvariable.ouGroupsetId.ProjectType;
        $scope.populationTypeId = commonvariable.ouGroupsetId.PopulationType;
        $scope.typeManagementId = commonvariable.ouGroupsetId.TypeManagement;
        $scope.gsEventId = commonvariable.ouGroupsetId.Event;
        $scope.gsContextId = commonvariable.ouGroupsetId.Context;
    };
    
	this.saveUsers=function(){
		
		var user
		
		for (var i=0; i<=10;i++) {
			
			user={}
			user.surname = commonvariable.userDirective
			user.userCredentials= {}
			user.userCredentials.password=commonvariable.users.passwd
			user.organisationUnits = [{"id":commonvariable.NewOrganisationUnit.id}]
			user.dataViewOrganisationUnits = [{"id":commonvariable.NewOrganisationUnit.id}]
			user.userGroups = [{"id":commonvariable.users.uid_project_users_userGroup}]			
			if (i == 0) { //MFP User
				user.firstName = commonvariable.users.postfix_mfp
				user.userCredentials.userRoles = [{"id":commonvariable.users.uid_role_mfp}]
				user.userCredentials.username=commonvariable.users.prefix + "-" + commonvariable.userDirective + "-" + commonvariable.users.postfix_mfp				
			} else { //FIELD User
				user.firstName = commonvariable.users.postfix_fielduser + i
				user.userCredentials.userRoles = [{"id":commonvariable.users.uid_role_fielduser}]
				user.userCredentials.username=commonvariable.users.prefix + "-" + commonvariable.userDirective + "-" + commonvariable.users.postfix_fielduser + i				
			}			
			console.log(user)
			
			User.POST(user).$promise.then(function (data) {
				
				console.log(data)
				
			});
			
		}				
	};
	
	
	this.saveProject = function (newOu) {
		
		var defered = $q.defer();
	    var promise = defered.promise;
	    var projectImported = false;
	    
		OrgUnit.POST({},newOu).$promise.then(function(data){
    		  console.log(data);
    		 // if (data.response.status == "SUCCESS") { ///verificar que en la versi�n 2.19 y 2.20 sea data.response.status
    		  if (data.response.importCount.imported >= 1) {
				  newOu.id=data.response.lastImported;
				  commonvariable.NewOrganisationUnit=newOu;
				  projectImported = true;
				 
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
				  

				  FilterResource.GET({resource:'dataSets', filter:'code:eq:'+commonvariable.codedatasets.codeDSVacStaff}).$promise
				  		.then(function(response){				  			
				  			if (response.dataSets.length>0) {				  				
				  				var dataSet = response.dataSets[0];
				  				DataSetsOrgUnit.POST({uidorgunit:newOu.id, uiddataset:dataSet.id});
				  			}				  							  			
				  		});
				  				  				  				  
			}
			else projectImported = false;
    
    		defered.resolve(projectImported);

		});		
		
		return promise;
	};
    
    


}]);