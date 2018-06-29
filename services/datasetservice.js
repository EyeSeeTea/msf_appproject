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

Dhis2Api.service('DatasetService', ['$q', 'DataSets', function ($q, DataSets) {

    const DEFAULT_LEVEL = "3";
    const SERVICE_EXCEPTIONS = {
        "OUG_HSV_MOHW": "OUG_DICT_MS",
        "OUG_HSV_MOEC": "OUG_DICT_MS",
        "OUG_HSV_ATFC": "OUG_DICT_NUT",
        "OUG_HSV_ITFC": "OUG_DICT_NUT",
        "OUG_HSV_TSFC": "OUG_DICT_NUT",
        "OUG_HSV_NS": "OUG_DICT_NUT"
    };

    /**
     * It accepts a health service code (like OUG_HS_ER) and returns a promise that resolves to an object with the
     * following structure:
     * { 'levels' : [
     *   {
     *     'value': <level> (like '2'),
     *     'periods: [
     *       {
     *         'value': <period> (like 'monthly'),
     *         'dataSets': [<array_of_datasets]
     *       }
     *     ]
     *   }
     * ]
     * @param healthServiceCode Code of the health service (like OUG_HS_...).
     * @returns {*} Promise that resolves to an object structured by level and period.
     */
    var getByService = function (healthServiceCode) {
        return getServiceMainDataSets( applyServiceExceptions(healthServiceCode) )
            .then(getRelatedDatasets)
            .then(formatDataSetsByLevelAndPeriod);
    };

    var getAllDataSets = function () {
        return DataSets.get().$promise.then( function (data) {
            return data.dataSets;
        })
            .then(formatDataSetsByLevelAndPeriod);
    };

    function getServiceMainDataSets (healthServiceCode) {
        const rootServiceCode = healthServiceCode.split('_')[2];

        return DataSets.get({}).$promise.then( response => {
            const filteredDatasets = response.dataSets.filter( ds => {
                return ds.attributeValues.some( entry => {
                    return (new RegExp(`_${rootServiceCode}$`)).test(entry.value) ||
                            (new RegExp(`_${rootServiceCode}_`)).test(entry.value)
                });
            });

            return {
                dataSets: filteredDatasets
            }
        });
    }

    function getRelatedDatasets (dataSetArray) {
        var promises = dataSetArray.dataSets.map( function (dataSet) {
            var commonCode = extractCommonCode(dataSet.code);
            var params = {
                filter: "code:like:" + commonCode
            };
            return DataSets.get(params).$promise.then( function (data) {
                // Filter dataset by commonCode
                return data.dataSets.filter( function (dataSet) {
                    return fitsCommonCode(dataSet.code, commonCode);
                })
            });
        });

        return $q.all(promises).then(function (data) {
            return data.reduce(function (previous, current) {
                return previous.concat(current);
            });
        });
    }

    function formatDataSetsByLevelAndPeriod (dataSetArray) {
        return dataSetArray.reduce(
            function (acc, dataSet) {
                var lastChar = dataSet.code[dataSet.code.length - 1];
                var level = isNaN(lastChar) ? DEFAULT_LEVEL : lastChar;
                var period = dataSet.periodType;

                var levelIndex = acc.levels.map(function (levelItem) { return levelItem.value;}).indexOf(level);

                if (levelIndex < 0) {
                    acc.levels.push({value: level, periods: []});
                    levelIndex = acc.levels.length - 1;
                }

                var periodIndex = acc.levels[levelIndex].periods.map( function (periodItem) { return periodItem.value;}).indexOf(period);

                if (periodIndex < 0) {
                    acc.levels[levelIndex].periods.push({value: period, dataSets: []});
                    periodIndex = acc.levels[levelIndex].periods.length - 1;
                }

                acc.levels[levelIndex].periods[periodIndex].dataSets.push(dataSet);
                return acc;
            },
            { levels: [] }
        );
    }

    function extractCommonCode (dsCode) {
        var commonCode = dsCode;
        // Check if last char is number. If so, delete it
        if (!isNaN(commonCode[commonCode.length - 1])) {
            commonCode = commonCode.substr(0, commonCode.length - 2);
        }
        // Check if last char is lowercase. If so, delete it.
        var lastChar = commonCode[commonCode.length - 1];
        if (lastChar.toLowerCase() == lastChar) {
            commonCode = commonCode.substr(0, commonCode.length - 1);
        }
        return commonCode;
    }

    function fitsCommonCode (dsCode, commonCode) {
        // It checks if dsCode is equal to commonCode plus something that is NOT an uppercase character (It would mean
        // that it fits other commonCode pattern
        var antiPattern = new RegExp('^' + commonCode + '[A-Z]');
        return !antiPattern.test(dsCode);
    }

    function applyServiceExceptions (healthServiceCode) {
        return SERVICE_EXCEPTIONS[healthServiceCode] || healthServiceCode;
    }

    return {
        getAllDataSets: getAllDataSets,
        getByService: getByService
    }

}]);