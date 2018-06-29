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

Dhis2Api.directive('d2Dropdownorgunitgroupset', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/orgunitgroupsets/orgunitGroupSetsView.html',
		scope: {
	        uidgroupset: '@',
	        operation: '@',
	        uidgroupsetfilterby: '@',
	        file: '@',
            id:'@'
	      }
		}
	}); 

Dhis2Api.controller("d2DropdownorgunitgroupsetController", ['$q','$scope','$http', 'OrgUnitGroupSet',"commonvariable", "OrgUnitGroupByOrgUnit", "loadjsonresource", "getIDOUG", function ($q, $scope, $http, OrgUnitGroupSet, commonvariable, OrgUnitGroupByOrgUnit, loadjsonresource, getIDOUG) {
	
    $scope.initValue = function () {
        $scope.ougName = "";
    };

    if ($scope.operation != "show") {
		
		$scope.disabled = false;
		
		if ($scope.uidgroupsetfilterby != undefined) {
			
			getOrgUnitGroup(commonvariable.OrganisationUnit.id, $scope.uidgroupsetfilterby).then(function(data){
				
				var parentOrgUnitGroupName = data;
				loadjsonresource.get($scope.file).then(function(response) {					
					$scope.ListOrgUnitGroups = getServiceTypeBySiteType(response.data.servicesBySite, parentOrgUnitGroupName.code);
				});
			});
		}
		
		else  {
			OrgUnitGroupSet.get({uid:$scope.uidgroupset}).$promise.then(function(data) {
				$scope.ListOrgUnitGroups = data.organisationUnitGroups;
						
			});
		
		}
	}
	
	
	$scope.selectOrgUnitGroup = function(ougSelected){ 
		$scope.ougName = ougSelected.name;
		
		getIDOUG.get({filter:'code:eq:'+ougSelected.code}).$promise.then(function(response) {

			commonvariable.orgUnitGroupSet[$scope.uidgroupset] = response.organisationUnitGroups[0];
		
		});
	};
	
	
	function getOrgUnitGroup (uidOrgUnit, uidOrgUnitGroupSet) {
				
		var defered = $q.defer();
        var promise = defered.promise;        

		OrgUnitGroupByOrgUnit.get({uid:uidOrgUnit}).$promise.then(function(data) {
			
			ouOrgUnitGroups = data.organisationUnitGroups;
			
			OrgUnitGroupSet.get({uid:uidOrgUnitGroupSet}).$promise.then(function(data) {
								
				ougsOrgUnitGroups = data.organisationUnitGroups;
				
			    try {
			    	
			    	var find = false;
			    	
			        for (var i = 0; i < ouOrgUnitGroups.length; i++) {
			        
			        	if (find == true) break;
			        
			            for (var j = 0; j < ougsOrgUnitGroups.length; j++) {
			                if (ouOrgUnitGroups[i].id == ougsOrgUnitGroups[j].id) {
			                	find = true;
			                    defered.resolve(ouOrgUnitGroups[i]);
			                    break;
			                }
			            }
			            
			        }
			    } catch (err) { }
			    
			});
			
		});
		
		return promise;
	}
	
	getServiceTypeBySiteType = function(servicesBySiteType, code) {
		
		var sites = servicesBySiteType.siteType;
		var services = {};
		
		for (var i=0; i<sites.length; i++) {			
			if (sites[i].code==code) {
				services = sites[i].services;
				break;
			}
		}
		return services;
	}
	
	$scope.prevOu = undefined;
	$scope.$watch(function () {

        //clear value 
	    if (commonvariable.clearForm[$scope.id] == true) {
	        $scope.initValue();
	        commonvariable.clearForm[$scope.id] = false;
	    }
	    ///
	    if ($scope.operation != $scope.prevOperation) {

	        try {
	            getOrgUnitGroup(commonvariable.OrganisationUnit.id, $scope.uidgroupset).then(function (data) {
	            	$scope.ougName = data.name;
	            	if ($scope.operation=="edit") {
	            	    commonvariable.preOrgUnitGroupSet[$scope.uidgroupset] = data;
                        ///
	            	    commonvariable.orgUnitGroupSet[$scope.uidgroupset] = data;
	            	}
	            })
	        } catch (err) {
	            console.log("Error, Organisation Unit doesn't selected");
	        }
	        
	        
			OrgUnitGroupSet.get({uid:$scope.uidgroupset}).$promise.then(function(data) {
				$scope.ListOrgUnitGroups=data.organisationUnitGroups;
						
			});

	        $scope.disabled = $scope.operation != 'edit';
			$scope.prevOperation = $scope.operation;

	    }

	    if (commonvariable.OrganisationUnit && commonvariable.OrganisationUnit.id != $scope.prevOu) {
	        $scope.prevOu = commonvariable.OrganisationUnit.id;

	         //function to call when change of OU
	        if ($scope.operation == "show") {

	        	$scope.disabled = true;
	            try{
	                getOrgUnitGroup(commonvariable.OrganisationUnit.id, $scope.uidgroupset).then(function (data) {
	                    $scope.ougName = data.name;
	                    if ($scope.uidgroupset == commonvariable.ouGroupsetId.HealthService) {
	                        commonvariable.healhservicesCodeOUG = data.code;
	                    }

	                })
	            }catch(err){
	                console.log("Error, Organisation Unit doesn't selected");
	            };
	        }

	    }
	});
	

}]);