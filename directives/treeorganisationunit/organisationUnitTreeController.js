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

Dhis2Api.directive('d2Treeorganisationunit', function(){
	return{
		restrict: 'E',
		templateUrl: 'directives/treeorganisationunit/organisationUnitTreeView.html',
		scope: {
		      treetype: '@',
		      size:'@'
		    }
	}
	}); 
Dhis2Api.controller("d2TreeorganisationUnitController", ['$scope','$q', '$location', 'TreeOrganisationunit', "commonvariable", "meUser", function ($scope,$q, $location, TreeOrganisationunit, commonvariable, meUser) {
	$scope.currentid="";
	 $scope.currentlevel=0;
    // $scope.loadOrganisationUnit=function(){
    //     TreeOrganisationunit.get({filter:'level:eq:1'})
    //	 .$promise.then(function(data){
    //		  $scope.treeOrganisationUnitList = data.organisationUnits;
    //	 });
    //};
    $scope.shortByName=function(listToSort){
            return  listToSort.sort(function(a, b) {
                var nameA = a.name.toUpperCase();
                var nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
     }

     $scope.recursiveShort=function(listToSort){
        return angular.forEach(listToSort,function(value,key){
            if(value.children){
                $scope.recursiveShort(value.children);
            }
            else{
                 return $scope.shortByName(listToSort);
            }
        });
     };
	 $scope.loadOrganisationUnit = function () {
	     meUser.get()
            .$promise.then(function (data) {
                $scope.treeOrganisationUnitList = [];
                var kvalue = 0;
                var numOU = 0;
                angular.forEach(data.organisationUnits, function (value, key) {
                    kvalue++;
                    numOU = data.organisationUnits.length;
                    TreeOrganisationunit.get({ uid: value.id })
                             .$promise.then(function (data) {
                                 $scope.treeOrganisationUnitList.push(data);
                                 if (kvalue == numOU) {
                                     $scope.loadingTree = false;
                                       $scope.treeOrganisationUnitList=$scope.recursiveShort($scope.treeOrganisationUnitList);
                                 }
                             });

                });
                //callBackAsync afer finish forecah
            });
	 };
    $scope.loadOrganisationUnit();
	 
	$scope.update = function (json, valorOrig, valorDest,treeup)		{
    	 var type;
    	 var resultado;
    	 for (var i=0; i<json.length;i++){
    	     type = typeof json[i].children;

    	     if (json[i].id == valorOrig) {
    	         switch (treeup) {
    	             case 0:
    	                 json[i].children = valorDest;
    	                 break;
    	             case 1:
    	                 json[i].children.push(valorDest);
    	                 break;
    	             case 2:
    	                 //json[i].name = valorDest.name;
    	                 json[i] = valorDest;
    	                 break;
    	         }

    	     }
    	 	if (type=="undefined"){
    			resultado = true; 
    		}
    		else{
    			resultado = $scope.update(json[i].children, valorOrig, valorDest,treeup);
    		}
    	}
   	 return json;
   }
    
	$scope.updateChildren = function (currentid) {
	    var defered = $q.defer();
	    var promise = defered.promise;

	    TreeOrganisationunit.get({ uid: currentid })
                            .$promise.then(function (data) {
                                ////disable display children if it has close date  
                                if ($scope.OrganisationUnit.currentNode.closedDate) {
                                    data.children = [];
                                }
                                ///
                                defered.resolve(data.children);
                            });
	    
	    return promise;
	};
  $scope.$watch(
            function(OrganisationUnit) {
            	   //refresh if it is neccesary
                   if(commonvariable.RefreshTreeOU){
                       commonvariable.RefreshTreeOU = false;
                       if (commonvariable.NewOrganisationUnit.length == 0) {
                           
                           $scope.updateChildren($scope.OrganisationUnit.currentNode.id).then(function (dataChildren) {
                               commonvariable.EditOrganisationUnit.children = dataChildren;
                               $scope.treeOrganisationUnitList = $scope.update($scope.treeOrganisationUnitList, $scope.OrganisationUnit.currentNode.id, commonvariable.EditOrganisationUnit, 2);
                               $scope.treeOrganisationUnitList = $scope.recursiveShort($scope.treeOrganisationUnitList);
                               commonvariable.EditOrganisationUnit = [];
                           });
                           
                       }
                       else {
                           $scope.treeOrganisationUnitList = $scope.update($scope.treeOrganisationUnitList, $scope.OrganisationUnit.currentNode.id, commonvariable.NewOrganisationUnit, 1);
                          $scope.treeOrganisationUnitList = $scope.recursiveShort($scope.treeOrganisationUnitList);
                           commonvariable.NewOrganisationUnit = [];
                       }
                    }

                try {

                    if($scope.OrganisationUnit.currentNode.closedDate)
                        $location.path('/Disabled');
                } catch (err) {

                };
                    //redirect to correct url
                if(typeof($scope.OrganisationUnit.currentNode)!="undefined" && !$scope.OrganisationUnit.currentNode.closedDate){//$scope.currentlevel!=$scope.OrganisationUnit.currentNode.level){
                        $scope.currentlevel=$scope.OrganisationUnit.currentNode.level;
                        var url="/";
                        switch($scope.currentlevel){
                            case 1:
                                url="/InternationalMSF";
                                break;
                             case 2:
                                url="/OperationalCenter";
                                break;                               
                            case 3:
                                url="/Mission";
                                break;
                            case 4:
                                url="/Project";
                                break;  
                            case 5:
                                url="/HealthSite";
                                break;                     
                            case 6:
                                url="/HealthService";
                                break;
                        }

                        $location.path(url);
                    }
                    

                    if($scope.OrganisationUnit.currentNode && $scope.currentid!=$scope.OrganisationUnit.currentNode.id && typeof($scope.OrganisationUnit.currentNode.children)=="undefined"){
            	   	    $scope.currentid=$scope.OrganisationUnit.currentNode.id;
						TreeOrganisationunit.get({uid:$scope.OrganisationUnit.currentNode.id})
						.$promise.then(function (data) {
                            ////disable display children if it has close date  
						    if ($scope.OrganisationUnit.currentNode.closedDate) {
						        data.children = [];
						    }
                            ///
							$scope.treeOrganisationUnitList=$scope.update($scope.treeOrganisationUnitList, $scope.OrganisationUnit.currentNode.id,data.children,0) 	
                             $scope.treeOrganisationUnitList = $scope.recursiveShort($scope.treeOrganisationUnitList);								  
						});
                    }

  	
                try {
                    if ($scope.OrganisationUnit.currentNode.id != $scope.PreOrganisationUnitId) {
                        switch ($scope.treetype) {
                            case "single":
                                commonvariable.OrganisationUnit = $scope.OrganisationUnit.currentNode;
                                $scope.PreOrganisationUnitId = $scope.OrganisationUnit.currentNode.id;
                                commonvariable.OrganisationUnitParentConf = {
                                    id: $scope.OrganisationUnit.currentNode.id,
                                    code: $scope.OrganisationUnit.currentNode.code,
                                    level: $scope.OrganisationUnit.currentNode.level,
                                    name: $scope.OrganisationUnit.currentNode.name,
                                    openingDate: $scope.OrganisationUnit.currentNode.openingDate,
                                    shortName: $scope.OrganisationUnit.currentNode.shortName
                                };
                                break;
                            case "multiple":
                                commonvariable.OrganisationUnitList = $scope.OrganisationUnit.listNodesSelected;
                                $scope.PreOrganisationUnitId = $scope.OrganisationUnit.currentNode.id;
                                break;
                        }
                    }
                } catch (err) {
                    $location.path('/InternationalMSF');
                };
            }
        );
}]);

