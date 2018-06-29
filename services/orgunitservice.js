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

Dhis2Api.service('OrgunitService', ['$q', 'commonvariable', 'OrganisationUnitChildren', 'OrgUnit', 'DemographicService', function ($q, commonvariable, OrganisationUnitChildren, OrgUnit, DemographicService) {
    
    var openOrgunit = function (orgunitId) {
        return OrganisationUnitChildren.get({uid:orgunitId, fields:'name,id,level'}).$promise.then(function(response){
            var targetOu = response.organisationUnits;

            var openTargetOuPromises = targetOu.map(function (orgUnit) {
                return OrgUnit.PATCH({id: orgUnit.id}, {closedDate: ''}).$promise;
            });

            var demographicPromises = targetOu.map(function (orgUnit) {
                return DemographicService.assignDemographicsDataset(orgUnit);
            });
            
            return $q.all(openTargetOuPromises.concat(demographicPromises)).then(function() {

                commonvariable.EditOrganisationUnit = commonvariable.OrganisationUnit;
                commonvariable.EditOrganisationUnit["closedDate"] = '';
                commonvariable.RefreshTreeOU = true;
            })
        });
    };

    return {
        openOrgunit: openOrgunit
    }
    
}]);