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

Dhis2Api.service('healthsiteService', ['$q', 'commonvariable', 'OrgUnit', 'FilterResource', 'DataSetsOrgUnit', 'GetMission', 'loadjsonresource', 'OrgUnitGroupByOrgUnit', 'OrgUnitOrgUnitGroups', 'OrganisationUnitChildren', 'OrgUnitGroupsOrgUnit',
                                       function ($q, commonvariable, OrgUnit, FilterResource, DataSetsOrgUnit, GetMission, loadjsonresource, OrgUnitGroupByOrgUnit, OrgUnitOrgUnitGroups, OrganisationUnitChildren, OrgUnitGroupsOrgUnit) {
    //get validation rules
	
	
    this.initValue=function($scope) {
    	
        $scope.siteTypeId = commonvariable.ouGroupsetId.SiteType;
        $scope.healthServiceId = commonvariable.ouGroupsetId.HealthService;
    	
    };
    
	getServiceType = function(servicesByServiceType) {
		
		var serviceTypes=servicesByServiceType.serviceType;
		
		var codeResult;
		
		var find = false;
		
		for (var i=0; i<serviceTypes.length; i++) {
			
			var serviceType = serviceTypes[i];
			
			if (find == true ) break;
			
			for (var j=0; j<serviceType.services.length; j++) {
				if (serviceType.services[j].code == commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.HealthService].code) {
					find = true;
					codeResult = serviceType.code;
					break;
				}
					
			}						
		}
		
		return codeResult;			
	};
	
	
	this.saveHealthService = function (newOu) {
		
		var defered = $q.defer();
	    var promise = defered.promise;
	    var serviceSaved = false;
	    
        OrgUnit.POST({}, newOu).$promise.then(function (data) {
            console.log(data);
            serviceSaved = true;
            
            if (data.response.status == "SUCCESS") {
                newOu.id = data.response.lastImported;
                commonvariable.NewOrganisationUnit = newOu;

                if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.HealthService] != undefined)
                    OrgUnitGroupsOrgUnit.POST({ uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.HealthService].id, uidorgunit: newOu.id });

                console.log(commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.HealthService].name)

                FilterResource.GET({ resource: 'dataSets', filter: 'code:eq:' + commonvariable.codedatasets.codeDSDemographic }).$promise
                  .then(function (response) {

                      if (response.dataSets.length > 0) {
                          var dataSet = response.dataSets[0];
                          DataSetsOrgUnit.POST({ uidorgunit: newOu.id, uiddataset: dataSet.id });
                      }

                  });

                if (commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.HealthService].name == "Vaccination") { //Assocate Vacc datasets 

                    GetMission.get({ uid: newOu.id }).$promise.then(function (data) {

                        var nameMission = data.parent.parent.parent.name

                        var nameVacDataSet = "Vaccination_" + nameMission

                        FilterResource.GET({ resource: 'dataSets', filter: 'name:eq:' + nameVacDataSet }).$promise
                          .then(function (response) {

                              if (response.dataSets.length > 0) {
                                  var dataSet = response.dataSets[0];
                                  DataSetsOrgUnit.POST({ uidorgunit: newOu.id, uiddataset: dataSet.id });
                              }

                          });

                    });
                }

                var codeServiceType = undefined;

                loadjsonresource.get("servicebyservicetype").then(function (response) {

                    codeServiceType = getServiceType(response.data.servicesByServiceType);

                    FilterResource.GET({ resource: 'organisationUnitGroups', filter: 'code:eq:' + codeServiceType }).$promise
                      .then(function (response) {

                          if (response.organisationUnitGroups.length > 0) {

                              var orgUnitGroup = response.organisationUnitGroups[0];
                              OrgUnitGroupsOrgUnit.POST({ uidgroup: orgUnitGroup.id, uidorgunit: newOu.id });

                          }

                      });


                });


                OrgUnitGroupByOrgUnit.get({ uid: commonvariable.OrganisationUnit.id }).$promise.then(function (response) {

                    listOrgUnitGroups = response.organisationUnitGroups;

                    angular.forEach(listOrgUnitGroups, function (value, key) {
                        OrgUnitGroupsOrgUnit.POST({ uidgroup: value.id, uidorgunit: newOu.id });
                    });

                });

            }
            else serviceSaved = false;
            
            defered.resolve(serviceSaved);
            
        });
        
        return promise;
		
	};
	


	 this.editHealthSite = function(idOu, editOu) {
		 
		 var defered = $q.defer();
		 var promise = defered.promise;
		 var siteEdited = false;

	     OrgUnit.PATCH({id:idOu},editOu).$promise.then(function(data){
	    	  
	    	  if (data.response.status=="SUCCESS") {
	    		  
	    		  
	    		  
                  //asign OU selected 
	    	      commonvariable.EditOrganisationUnit = commonvariable.OrganisationUnit;
                  ///replace with new value
	    	      commonvariable.EditOrganisationUnit.name = editOu.name;
	    	      commonvariable.EditOrganisationUnit.shortName= editOu.name;
	    	      commonvariable.EditOrganisationUnit.code = commonvariable.OrganisationUnit.code;
	    	      commonvariable.EditOrganisationUnit.openingDate = editOu.openingDate;
	    	      
                  //refresh tree for show change
	    	      
	    	      if ( typeof commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.SiteType] != "undefined") {
	    	      
	    	    	  OrganisationUnitChildren.get({ uid: data.response.lastImported, fields: 'name,id,code,level' }).$promise.then(function (response) {
		   			   
	    	    		  var children=response.organisationUnits;
	   				    	    		  
	    	    	      angular.forEach(children, function(orgUnit, key){	    	  
	    	    	    	  //updateOrgUnitGroups(orgUnit)
	    	    	    	  
	    	    			  /*if (typeof(commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.SiteType])=="undefined")
	    	    				  OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.SiteType].id }).$promise.then(function(data){
	    	    					  if (data.$resolved==true)
	    	    						  if (orgUnit.level == commonvariable.level.HealthSite)
	    	    							  siteEdited = true;
	    	    							  
	    	    				  })*/
	    	    		        	  
	    	    	          if (commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.SiteType].id != commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.SiteType].id) {
	    	    	              OrgUnitOrgUnitGroups.DELETE({ uidorgunit: orgUnit.id, uidgroup: commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.SiteType].id }).$promise.then(function (data) {
	    	    	                  OrgUnitOrgUnitGroups.POST({ uidorgunit: orgUnit.id, uidgroup: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.SiteType].id }).$promise.then(function (data) {
	    	    	                      if (data.$resolved == true)
	    	    	                          if (orgUnit.level == commonvariable.level.HealthSite) {
	    	    	                              siteEdited = true;
	    	    	                              defered.resolve(siteEdited);
	    	    	                          }

	    	    	                  })
	    	    	              });
	    	    	          }
	    	    	          else {
	    	    	              siteEdited = true;
	    	    	              defered.resolve(siteEdited);
	    	    	          }
	    	    	      });

						   
	    	    		  //$scope.healthsitename =  commonvariable.ouDirective;				   					   
	    	    	  });	    	      
	    	      } else { siteEdited = true; defered.resolve(siteEdited); }
	    	  }
	    	  else
	    		  siteEdited = false;
	    	  
	      
	      });		 
	     
	     return promise;
	 };
	 
}]);