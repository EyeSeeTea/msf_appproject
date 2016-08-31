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

appConfigProjectMSF.controller('projectController', ["$scope", "$timeout", '$filter', "commonvariable", "$modal", "validatorService", "projectService",
                                                     function ($scope, $timeout, $filter, commonvariable, $modal, validatorService, projectService) {
	
	
	projectService.initValue($scope);
	
	//set message variable
	$scope.closeAlertMessage = function(index) {
       $scope.messages.splice(index, 1);
  	};
	
	$scope.messages=[];
	
	$scope.prevOu=undefined;
	
	var $translate = $filter('translate');
	
	$scope.showfields=false;
	
	$scope.validateLength = function () {
	    $scope.siteprefix = $scope.siteprefix.substring(0, 3);
	    if ($scope.siteprefix.length != 3) {
	        $scope.alertlength = true;
	        $timeout(function () { $scope.alertlength = false }, 1500);
	        $scope.lengthmax = 'has-error';
	       
	    }
	    else {
	        $scope.alertlength = false;
	        $scope.lengthmax = '';
	    }

	};
	$scope.sitesave = function () {

	    var codeOrgUnit = undefined;

	    if (commonvariable.OrganisationUnit.code != undefined && commonvariable.OrganisationUnit.code.length >= 7)
	        codeOrgUnit = "OU_" + commonvariable.OrganisationUnit.code.slice(2, 7) + $scope.siteprefix;


	    var newOu = {//payload and other validate for Validate
	        name: commonvariable.ouDirective,
	        level: (commonvariable.OrganisationUnit.level + 1),
	        shortName: commonvariable.ouDirective,
	        code: codeOrgUnit,
	        openingDate: $filter('date')($scope.siteDate, 'yyyy-MM-dd'),
	        parent: commonvariable.OrganisationUnitParentConf,
	        healthsitetype: commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.SiteType]
	    };
        ///validate if object is ok.
	    validatorService.emptyValue(newOu).then(function (result) {
	        if (result == false && $scope.siteprefix!="") {
           
	            projectService.saveHealthSite(newOu).then(function (result) {
	            	if (result == true) {

	            		commonvariable.RefreshTreeOU = true;
	            		
	            		if (commonvariable.userDirective.trim() != "")
	            			projectService.saveSiteUser();

                        //set message variable
                        $scope.messages.push({
                            type: "success", text: $translate("SITE_SAVED")
                        });

                        $scope.hideForm();
                        	            	}
	            	else 
                        $scope.messages.push({
                            type: "danger", text: $translate("SITE_NOSAVED")
                        });	            		
	            });

	        }
	        else {
	            $scope.messages.push({
	                type: "warning",
	                text: $translate("FORM_MSG_EMPTYFIELD")
	            });
	        }
	    });
	};
		
	
	
	$scope.showForm=function(frm){
		
	    if (frm == 1) {
	        commonvariable.clearForm["hsname"] = true;
	        commonvariable.clearForm["healthsitetype"] = true;
	        commonvariable.clearForm["usernameproject"] = true;
	        $scope.siteDate = "";
	        $scope.siteprefix = "";
			$scope.frmSite=true;
		}
		else{
			$scope.frmSite=false;
		}

	};
	
	
	
	$scope.hideForm=function(){
		//$scope.mdname="";
		$scope.today();
		$scope.showfields = false;
		$scope.alertlength = true;
	    //clear txtbox
		$scope.siteName = "";
		$scope.frmSite = false;

	    //Clear Common Variables
		commonvariable.PeriodSelected = [];
		commonvariable.DataElementSelected = [];
		commonvariable.ouDirective = "";
		commonvariable.ouDirectiveCode = "";
		commonvariable.userDirective = "";
	};

	
	$scope.$watch(
			function ($scope) {

                
				if(commonvariable.OrganisationUnit!=undefined && commonvariable.OrganisationUnit.id != $scope.prevOu){

				    $scope.operation = 'show';
				    $scope.messages = [];

				    $scope.prevOu = commonvariable.OrganisationUnit.id;

					$scope.projectname=commonvariable.OrganisationUnit.name;
					$scope.projectcode=commonvariable.OrganisationUnit.code;
					$scope.projectcreated = commonvariable.OrganisationUnit.openingDate;

					$scope.hideForm();
			}
			});
	
	
	// Date datepicker
	  $scope.today = function() {
	    datetoday = new Date();
	    $scope.siteDate=datetoday.getFullYear()+"-"+((datetoday.getMonth()+1)<=9?"0"+(datetoday.getMonth()+1):(datetoday.getMonth()+1))+"-"+(datetoday.getDate()<=9?"0"+datetoday.getDate():datetoday.getDate());
	  };
	  $scope.today();
	  
	  $scope.opensitedate = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.openedsite = true;
	  };
	  
	  $scope.openprojectdate = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.openedproject = true;
	  };
	  
	
    ////////////////////////For Edit //////////////////////////////////////////

    //set message variable
	  $scope.closeAlertMessage = function (index) {
	      $scope.messages.splice(index, 1);
	  };

	  $scope.messages = [];
    ///enable textBox
	  $scope.operation = 'show';
	  $scope.enableforEdit = function () {
	      $scope.operation = 'edit';
	      commonvariable.NewOrganisationUnit = [];
	      
	      //Getting the current org. unit groups
	      
	      commonvariable.ouDirective = $scope.projectname
	      commonvariable.ouDirectiveCode = $scope.projectcode
	      
	      
	  }
	  
	  
	  $scope.enableforshow = function () {
	      $scope.operation = 'show';
	  }
	  
	  

    ////Edit PROJECT
	  $scope.EditProject = function () {
		  		  		  
		  		   		   		   
	      var editOu = {//payload
	          name: commonvariable.ouDirective,
	          shortName: commonvariable.ouDirective,
	          code: commonvariable.ouDirectiveCode,
	          openingDate: $filter('date')($scope.projectcreated, 'yyyy-MM-dd')
	      };
	      
	      projectService.editProject(commonvariable.OrganisationUnit.id, editOu).then(function (result){
	    	 
	    	  if (result == true) {
                  //refresh tree for show change
	    	      commonvariable.RefreshTreeOU = true;
	    	      
	    		  $scope.projectname =  commonvariable.ouDirective;
	    		  $scope.projectcode = commonvariable.ouDirectiveCode;
	    		  
	    		  $scope.operation = 'show';
	    	      
	    	      $scope.messages.push({ type: "success", text: $translate('PROJECT_UPDATED') });
	    	      
	    	  } else
					$scope.messages.push({type:"danger",
					    text: $translate('PROJECT_UPDATED_MSG')});	    		  
	    	  
	      });
	      
	      
	      
	  }


    ///Delete PROJECT
	  $scope.DeleteProject = function () {
	      ///
	      $scope.messages.push({ type: "success", text: $translate('PROJECT_DELETED') });

	  }



    /////modal for delete message

	  $scope.modalDelete = function (size) {

	      var modalInstance = $modal.open({
	          templateUrl: 'ModalConfirm.html',
	          controller: 'ModalConfirmCtrl',
	          size: size,
	          resolve: {
	              information: function () {
	                  return { tittle: $translate('PROJECT_DELETE_TITTLE'), description: $translate('PROJECT_DELETE_DESCRIPTION'), id: commonvariable.OrganisationUnit.id };
	              }
	          }
	      });

	      modalInstance.result.then(function (option) {
	          if (option == true) {
	              $scope.messages.push({ type: "success", text: $translate('PROJECT_DELETED') });
	          }
	          else {
	              $scope.messages.push({ type: "error", text: $translate('PROJECT_NODELETED') });
	          }
	      }, function () {
	          console.log('Modal dismissed at: ' + new Date());
	      });
	  };



}]);


