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

Dhis2Api.service('projectService', ['$q', 'commonvariable', 'User', 'OrgUnitOrgUnitGroups', 'OrgUnit', 'OrgUnitGroupsOrgUnit', 'FilterResource', 'OrgUnitGroupByOrgUnit', 'OrganisationUnitChildren', 'DataSetsOrgUnit',
                                    function ($q, commonvariable, User, OrgUnitOrgUnitGroups, OrgUnit, OrgUnitGroupsOrgUnit, FilterResource, OrgUnitGroupByOrgUnit, OrganisationUnitChildren, DataSetsOrgUnit) {
	
	
    this.initValue=function($scope) {
    	
        $scope.projectTypeId = commonvariable.ouGroupsetId.ProjectType;
        $scope.populationTypeId = commonvariable.ouGroupsetId.PopulationType;
        $scope.typeManagementId = commonvariable.ouGroupsetId.TypeManagement;
        $scope.gsEventId = commonvariable.ouGroupsetId.Event;
        $scope.gsContextId = commonvariable.ouGroupsetId.Context;
        $scope.siteTypeId = commonvariable.ouGroupsetId.SiteType;    	
    	
    };
    
	this.saveSiteUser=function(){
		
		var user = {}
					
		user.surname = commonvariable.users.prefix + "-" + commonvariable.userDirective + "-" + commonvariable.users.postfix_siteuser
		user.userCredentials= {}
		user.userCredentials.password=commonvariable.users.passwd
		user.organisationUnits = [{"id":commonvariable.NewOrganisationUnit.id}]
		user.dataViewOrganisationUnits = [{"id":commonvariable.NewOrganisationUnit.id}]
		user.userGroups = [{"id":commonvariable.users.uid_project_users_userGroup}]

			
		user.firstName = commonvariable.users.postfix_siteuser
		user.userCredentials.userRoles = [{"id":commonvariable.users.uid_role_fielduser}]
		user.userCredentials.username=commonvariable.users.prefix + "-" + commonvariable.userDirective + "-" + commonvariable.users.postfix_siteuser
			
		User.POST(user).$promise.then(function (data) {
				
				console.log(data)
				
		});
			
	};    
	
	updateOrgUnitGroups = function (orgUnit) {
		  
		try {
			if (typeof(commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType])!="undefined") {

				if (typeof(commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType])=="undefined")
					OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType].id })
	        	  
				else if (commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType].id != commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType].id) {
					OrgUnitOrgUnitGroups.DELETE({ uidorgunit: orgUnit.id, uidgroup: commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType].id }).$promise.then(function(data){
						OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType].id })	        				  
	        		});
	        	}
	        }
		} catch (err) {
	    };

	    	  
	    try {	        	 
	    	if (typeof(commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context])!="undefined") {
	        		  
	    		if (typeof(commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.Context])=="undefined" )
	    			OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context].id });
	        	  
	        	else if (commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.Context].id != commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context].id) {
	        		OrgUnitOrgUnitGroups.DELETE({ uidorgunit: orgUnit.id, uidgroup: commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.Context].id }).$promise.then(function(data){
	        			OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context].id });	        				  
	        		});
	        	}
	        }       
	    } catch (err) {
	    };
	          
	    try {
	    	if (typeof(commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType])!="undefined") {

	    		if (typeof(commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType])=="undefined")
	    			OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType].id })

	        	else if (commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType].id != commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType].id) {
	        		OrgUnitOrgUnitGroups.DELETE({ uidorgunit: orgUnit.id, uidgroup: commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType].id }).$promise.then(function(data){
	        			OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType].id })	        				  
	        		})
	        	}
	        }
	     } catch (err) {
	     };
	          
	          
	     try {
	    	 if (typeof(commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement])!="undefined") {

	    		 if (typeof(commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement])=="undefined")
	    			 OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement].id })
	    		
	    		 else if (commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement].id != commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement].id) {
	    			 OrgUnitOrgUnitGroups.DELETE({ uidorgunit: orgUnit.id, uidgroup: commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement].id }).$promise.then(function(data){
	    				 OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement].id })	        				  
	    			 });
	    		 }
	    	 }
	      } catch (err) {	        	  
	      };
	          
	      try {
	    	  if (typeof(commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event])!="undefined") {

	    		  if (typeof(commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.Event])=="undefined")
	    			  OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event].id })
	                  
	    		  else if (commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.Event].id != commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event].id) {
	    			  OrgUnitOrgUnitGroups.DELETE({ uidorgunit: orgUnit.id, uidgroup: commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.Event].id }).$promise.then(function(data){
	    				  OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event].id })	        				  
	    			  });
	    		  }
	    	  }
	       } catch (err) {
	       };
		  
	  };
    
	  updateCodes = function (orgUnit) {
	      var defered = $q.defer();
	      var promise = defered.promise;
		  if (orgUnit.level == commonvariable.level.HealthSite || orgUnit.level == commonvariable.level.HealthService) {
			  
			  var textToUpdate = "OU_" + commonvariable.ouDirectiveCode.slice(2, 7);
			  var newCode = textToUpdate + orgUnit.code.slice(7);
			  
		      OrgUnit.PATCH({id:orgUnit.id},{code:newCode}).$promise.then(function(data){
		          defered.resolve(data);
		    	  if (data.response.status!="SUCCESS")
		    		  console.log("Eror");
		    	  
		      });			  
			  
		  }
		
		  return promise;
	  };
	  
	  updateOrgUnits = function (orgUnits) {
	      var defered = $q.defer();
	      var promise = defered.promise;

	      angular.forEach(orgUnits, function(orgUnit, key){
	    	  
	    	  updateOrgUnitGroups(orgUnit);
	    	  
	    	  if (typeof orgUnit.code != 'undefined')
	    	  
	    		  updateCodes(orgUnit).then(function (data) {

	    		  });

	    	  if (orgUnits.length - 1 == key) {
	    	      defered.resolve(true);
	    	  }
	    	  
	      });	     
	      return promise;
		  
	  };
	  
	  
	  this.saveHealthSite = function (newOu){
		  
	      var defered = $q.defer();
	      var promise = defered.promise;
	      var siteImported = false;

          OrgUnit.POST({}, newOu).$promise.then(function (data) {
              
        	  console.log(data);
              // if(data.response.status=="SUCCESS"){
              if (data.response.importCount.imported >= 1) {
            	  siteImported = true;
                  
                  newOu.id = data.response.lastImported;
                  commonvariable.NewOrganisationUnit = newOu;

                  if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.SiteType] != undefined) {

                      OrgUnitGroupsOrgUnit.POST({ uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.SiteType].id, uidorgunit: newOu.id });
                  }

                  OrgUnitGroupByOrgUnit.get({ uid: commonvariable.OrganisationUnit.id }).$promise.then(function (response) {

                      listOrgUnitGroups = response.organisationUnitGroups;

                      angular.forEach(listOrgUnitGroups, function (value, key) {
                          OrgUnitGroupsOrgUnit.POST({ uidgroup: value.id, uidorgunit: newOu.id });
                      });

                  });

                  FilterResource.GET({ resource: 'dataSets', filter: 'code:eq:' + commonvariable.codedatasets.codeDSDemographic }).$promise
                    .then(function (response) {

                        if (response.dataSets.length > 0) {

                            var dataSet = response.dataSets[0];
                            DataSetsOrgUnit.POST({ uidorgunit: newOu.id, uiddataset: dataSet.id });
                        }

                    });

              }
              else {            	  
            	  siteImported = false;
              }
              
              defered.resolve(siteImported);
              
          });		  

          return promise;              
		  
	  };
	  
	  
	  this.editProject = function(idOu, editOu){

	      var defered = $q.defer();
	      var promise = defered.promise;
	      var projectEdited = false;		  
		  
	      OrgUnit.PATCH({id:idOu},editOu).$promise.then(function(data){
	    	  	    	  
	    	  if (data.response.status=="SUCCESS") {
	    		  
	    		  //projectEdited=true;
	    		  //asign OU selected 
	    	      commonvariable.EditOrganisationUnit = commonvariable.OrganisationUnit;
                  ///replace with new value
	    	      commonvariable.EditOrganisationUnit.name = editOu.name;
	    	      commonvariable.EditOrganisationUnit.shortName= editOu.codeshortName
	    	      commonvariable.EditOrganisationUnit.code = editOu.code;
	    	      commonvariable.EditOrganisationUnit.openingDate = editOu.openingDate;
                  //refresh tree for show change

	    	      OrganisationUnitChildren.get({ uid: data.response.lastImported, fields: 'name,id,code,level' }).$promise.then(function (response) {
	    		   	   			   
	    	    	  var children=response.organisationUnits;	    	    	  
	    	    	  updateOrgUnits(children).then(function (upData) {
	    	    	      defered.resolve(true);
	    	    	  });
	    	  
	    	      });	
	    		  	    		  
	    	  }
	    	  else
	    	      defered.resolve(false);

	    	  
	      });
	      
	      return promise;
		  
	  };


}]);