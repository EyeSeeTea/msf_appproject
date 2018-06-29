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

Dhis2Api.service("healthserviceService", ["$q", "commonvariable", "OrgUnitOrgUnitGroups", "commonService", "loadjsonresource", "FilterResource", "OrgUnit", "OrgUnitGroupsOrgUnit",
        function($q, commonvariable, OrgUnitOrgUnitGroups, commonService, loadjsonresource, FilterResource, OrgUnit, OrgUnitGroupsOrgUnit) {
    
    //get validation rules
    this.initValue = function($scope) {
        $scope.healthServiceId = commonvariable.ouGroupsetId.HealthService;
        commonService.selectOrgUnitGroup(
            commonvariable.OrganisationUnit.id,
            commonvariable.ouGroupsetId.HealthServiceType
        )
        .then(ouGroup => $scope.servicetype = ouGroup.name);
    };

    updateOUVariable = function(editOu) {
        //asign OU selected
        commonvariable.EditOrganisationUnit = commonvariable.OrganisationUnit;
        ///replace with new value
        commonvariable.EditOrganisationUnit.name = editOu.name;
        commonvariable.EditOrganisationUnit.shortName = editOu.name;
        commonvariable.EditOrganisationUnit.code = editOu.code;
        commonvariable.EditOrganisationUnit.openingDate = editOu.openingDate;
    };

    this.editHealthService = function(idOu, editOu, $scope) {
        var defered = $q.defer();
        var promise = defered.promise;
        var healthServiceEdited = false;

        const preHealthService = commonvariable.preOrgUnitGroupSet[commonvariable.ouGroupsetId.HealthService];
        const newHealthService = commonvariable.orgUnitGroupSet[commonvariable.ouGroupsetId.HealthService]
        if ( preHealthService.id != newHealthService.id ) {
            OrgUnitOrgUnitGroups.DELETE({
                uidorgunit: commonvariable.OrganisationUnit.id,
                uidgroup: preHealthService.id
            }).$promise
            .then( data => {
                commonService.deleteOrgUnitGroup(
                    commonvariable.OrganisationUnit.id,
                    commonvariable.ouGroupsetId.HealthServiceType
                )
                .then( data => {
                    OrgUnitOrgUnitGroups.POST({
                        uidorgunit: commonvariable.OrganisationUnit.id,
                        uidgroup: newHealthService.id
                    });
                    commonvariable.healhservicesCodeOUG = newHealthService.code;

                    editOu.name = newHealthService.name;

                    loadjsonresource.get("healthservice").then( response => {
                        healthServiceSuffix = commonService.getServiceSuffix(response.data.healthserviceSuffix).suffix;

                        healthServiceCode = commonvariable.OrganisationUnit.parent.code + "_" + healthServiceSuffix;

                        //if (commonvariable.OrganisationUnit.children.length>0)
                        //  healthServiceCode = healthServiceCode +"_" + (commonvariable.OrganisationUnit.parent.children.length + 1);

                        editOu.code = healthServiceCode;

                        var codeServiceType = undefined;

                        loadjsonresource.get("servicebyservicetype").then( response => {
                            codeServiceType = getServiceType(response.data.servicesByServiceType);

                            FilterResource.GET({
                                resource: "organisationUnitGroups",
                                filter: "code:eq:" + codeServiceType
                            }).$promise
                            .then( response => {
                                if (response.organisationUnitGroups.length > 0) {
                                    var orgUnitGroup = response.organisationUnitGroups[0];
                                    OrgUnitGroupsOrgUnit.POST({
                                        uidgroup: orgUnitGroup.id,
                                        uidorgunit: commonvariable.OrganisationUnit.id
                                    }).$promise
                                    .then( data => {
                                        OrgUnit.PATCH({ id: idOu }, editOu).$promise.then( data => {
                                            if (data.response.status == "SUCCESS") {
                                                healthServiceEdited = true;
                                                //asign OU selected
                                                updateOUVariable(editOu);
                                                $scope.code = editOu.code;
                                                $scope.name = editOu.name;
                                            }
                                            defered.resolve(healthServiceEdited);
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        } 
        else {
            OrgUnit.PATCH({ id: idOu }, editOu).$promise.then(
                success => {
                    updateOUVariable(editOu);
                    defered.resolve(true);
                },
                error => {
                    defered.resolve(false);
                }
            );
        }

        return promise;
    };
}]);
