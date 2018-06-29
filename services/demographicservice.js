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

Dhis2Api.service('DemographicService', ['$q', 'FilterResource', 'DataSetsOrgUnit', function ($q, FilterResource, DataSetsOrgUnit) {

    const POP_Q_CODE = "DS_POP_Q";
    const DEM_CODE = "DS_DEM";

    var assignPopulationDataSet = function (orgunitId) {
        return assignDataSetByCode(POP_Q_CODE, orgunitId);
    };

    var assignDemographicInfoDataSet = function (orgunitId) {
        return assignDataSetByCode(DEM_CODE, orgunitId);
    };
    
    function assignDataSetByCode (dsCode, orgunitId) {
        return getDatasetByCode(dsCode).then( function (dsId) {
            return DataSetsOrgUnit.POST({ uidorgunit: orgunitId, uiddataset: dsId });
        })
    }

    // TODO Cache the dataset id
    function getDatasetByCode (dsCode) {
        return FilterResource.GET({ resource: 'dataSets', filter: 'code:eq:' + dsCode }).$promise
            .then(function (response) {
                if (response.dataSets.length > 0) {
                    return response.dataSets[0].id;
                }
            });
    }


    var assignDemographicsDataset = function (orgunit) {
        switch (orgunit.level) {
            case 3: // Mission level
                return assignDemographicInfoDataSet(orgunit.id);
                break;
            case 4:
                return assignDemographicInfoDataSet(orgunit.id).then(function() {
                    return assignPopulationDataSet(orgunit.id);
                });
                break;
            case 5:
                return assignPopulationDataSet(orgunit.id);
                break;
            default:
                return $q.when("No demographic dataSet at this level");
        }
    };

    return {
        assignDemographicsDataset: assignDemographicsDataset,
        assignDemographicInfoDataSet: assignDemographicInfoDataSet,
        assignPopulationDataSet: assignPopulationDataSet
    }

}]);