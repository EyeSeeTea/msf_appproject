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

appConfigProjectMSF.controller('missionController', ["$scope", '$filter', "commonvariable", "$modal", "validatorService", "missionService", "OrgUnitChildren",
                                                     function ($scope, $filter, commonvariable, $modal, validatorService, missionService, OrgUnitChildren) {
    var $translate = $filter('translate');
    //Load Data of OU selected
    $scope.prevOu = "";
    $scope.showbutton = true;
    $scope.CreateDatasetVaccination = true;
    
    missionService.initValue($scope);
   
    // if there exist Vaccination DataSet   then show the DataElements  
    $scope.showDataSetforEdit = function () {
        $scope.showForm(2);
    }
    //set message variable
	$scope.closeAlertMessage = function(index) {
       $scope.messages.splice(index, 1);
  	};
	
	$scope.messages=[];	
	
	$scope.showfields=false;

	///Save project
	$scope.projectsave=function(){

		var newOu = {//payload
		    name: commonvariable.ouDirective,
		    level: (commonvariable.OrganisationUnit.level + 1),
		    code: commonvariable.ouDirectiveCode,
		    shortName: commonvariable.ouDirective,
		    openingDate: $filter('date')($scope.propendate, 'yyyy-MM-dd'),
		    parent: commonvariable.OrganisationUnitParentConf,
		    projecttype: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType],
		    populationtype: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType],
		    typemanager: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement],
		    eventid: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event],
		    contextid: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context],
		    userForValidate: commonvariable.userDirective
		};
		///validate if object is ok.
		validatorService.emptyValue(newOu).then(function (result) {
		    if (result == false) {
		    	
		    	missionService.saveProject(newOu).then(function(imported){
		    		if (imported) {
		    		      commonvariable.RefreshTreeOU=true;
		    		      missionService.saveUsers();
		 				 //set message variable
						  $scope.messages.push({ type: "success", text: $translate('PROJECT_SAVED') });
						  $scope.hideForm();
						  //clear txtbox
						  $scope.projectName="";
		    		} else 		        
		   		      	$scope.messages.push({ type: "danger", text: $translate('PROJECT_NOSAVED') });
		    	});
		    	
		    }
		    else 
		    	$scope.messages.push({type: "warning", text: $translate("FORM_MSG_EMPTYFIELD")});
				    
		 });
				
	};
	
	
	$scope.showForm = function (frm) {
	    $scope.showbutton = false;

	   
		if(frm==1){
		    ///Clear form /////////////
		    commonvariable.clearForm["username"] = true;
		    commonvariable.clearForm["contextid"] = true;
		    commonvariable.clearForm["eventid"] = true;
		    commonvariable.clearForm["typemanager"] = true;
		    commonvariable.clearForm["populationtype"] = true;
		    commonvariable.clearForm["projecttype"] = true;
		    commonvariable.clearForm["projectcode"] = true;
		    commonvariable.clearForm["projectname"] = true;
		    $scope.propendate = "";

            //////////////////////////
			$scope.frmVaccination=false;
			$scope.frmProject=true;
			commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.ProjectType] = undefined
			commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.PopulationType] = undefined
			commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.TypeManagement] = undefined
			commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Event] = undefined
			commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.Context] = undefined						
		}
		else{
			$scope.frmVaccination=true;
			$scope.frmProject=false;
		}

	};

	$scope.hideForm=function(){
		$scope.projectName="";
		$scope.today();
		$scope.showfields=false;
		$scope.frmVaccination=false;
		$scope.frmProject = false;
		$scope.showbutton = true;

		$scope.getChildrenByOUID(commonvariable.OrganisationUnit.id);
		$scope.vaccinationName="";
		$scope.vaccinationCode="";
	    $scope.dataSetDescription=""
	  

	    //Clear Common Variables
	    commonvariable.PeriodSelected = [];
	    commonvariable.DataElementSelected = [];
	    commonvariable.ouDirective = "";
	    commonvariable.ouDirectiveCode = "";
	    commonvariable.userDirective = "";

	};

    // Date datepicker
	  $scope.today = function() {
	    datetoday = new Date();
	    $scope.propendate=datetoday.getFullYear()+"-"+((datetoday.getMonth()+1)<=9?"0"+(datetoday.getMonth()+1):(datetoday.getMonth()+1))+"-"+(datetoday.getDate()<=9?"0"+datetoday.getDate():datetoday.getDate());
	  };
	  
	  $scope.today();

	  $scope.clear = function () {
	    $scope.propendate = null;
	  };

	   $scope.open = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.opened = true;
	  };
    /////////////////////////////////////////

	 
	   $scope.getChildrenByOUID = function (uidSelected) {
	       OrgUnitChildren.get({ uid :uidSelected})
           .$promise.then(function (dataChild){
               $scope.ListChildren = dataChild.children;
	        });
	   }
    ///
	   $scope.$watch(function () {
	       if (commonvariable.OrganisationUnit && commonvariable.OrganisationUnit.id != $scope.prevOu) {
	           try {

	               $scope.missionname = commonvariable.OrganisationUnit.name;
	               $scope.prevOu = commonvariable.OrganisationUnit.id;

	               $scope.hideForm();
	               //get Children for OU selected

	               $scope.getChildrenByOUID(commonvariable.OrganisationUnit.id);
	           } catch (err) {
	               console.log("Error, Organisation Unnit doesn't selected");
	           };
	       }
	   });
      
}]);



