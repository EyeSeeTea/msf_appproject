appConfigProjectMSF.controller('operationalCenterController', ["$scope", '$filter', "commonvariable", "OrgUnit", "OrgUnitChildren","OrganisationUnitFind", function ($scope, $filter, commonvariable, OrgUnit, OrgUnitChildren,OrganisationUnitFind) {
	
	//set message variable
	$scope.closeAlertMessage = function(index) {
       $scope.messages.splice(index, 1);
  	};
	
	$scope.messages=[];
	

	var $translate = $filter('translate');
	$scope.showfields=false;
	$scope.missionsave=function(){
		var newOu={//payload
				name:commonvariable.ouDirective,
				level:(commonvariable.OrganisationUnit.level+1),
	            shortName:commonvariable.ouDirective,
	           	openingDate:$scope.mdopendate,
	           	parent: commonvariable.OrganisationUnitParentConf
				};
		console.log(newOu);
		OrgUnit.POST({},newOu)
		.$promise.then(function(data){
    		  console.log(data);
    		  if(data.status=="SUCCESS"){
    		  	  commonvariable.RefreshTreeOU=true;
				  newOu.id=data.lastImported;
				  commonvariable.NewOrganisationUnit=newOu;
				 //set message variable
				$scope.messages.push({type:"success",
				    text: $translate('MISSION_SAVED')
				});
				$scope.getChildrenByOUID(commonvariable.OrganisationUnit.id);
				$scope.hideForm();
				//clear txtbox
				$scope.mdname="";

			}
			else{
				$scope.messages.push({type:"danger",
				    text: $translate('MISSION_NOSAVED')
				});
				$scope.seeForm = false;
			}
    	 });
		
	};
	$scope.showForm=function(){
		if(commonvariable.OrganisationUnit==undefined){
				$scope.messages.push({type:"info",
				text:"Please select an operational center"});
				$scope.showfields=false;
		}
		else{
			$scope.showfields=true;
		}
	};
	$scope.hideForm=function(){
		$scope.mdname="";
		$scope.today();
		$scope.showfields=false;
	};
	
	// Date datepicker
	  $scope.today = function() {
	    datetoday = new Date();
	    $scope.mdopendate=datetoday.getFullYear()+"-"+((datetoday.getMonth()+1)<=9?"0"+(datetoday.getMonth()+1):(datetoday.getMonth()+1))+"-"+(datetoday.getDate()<=9?"0"+datetoday.getDate():datetoday.getDate());
	  };
	  $scope.today();

	  $scope.clear = function () {
	    $scope.mdopendate = null;
	  };

	   $scope.open = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.opened = true;
	  };
    /////////////////////////////////////////

	   $scope.getChildrenByOUID = function (uidSelected) {
	       OrgUnitChildren.get({ uid: uidSelected })
           .$promise.then(function (dataChild) {
               $scope.ListChildren = dataChild.children;
               //console.log($scope.ListChildren);
           });
	   }
	   $scope.getChildrenByOUID(commonvariable.OrganisationUnit.id);

}]);


