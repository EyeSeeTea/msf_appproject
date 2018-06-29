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

/*
 *	Architeture 
 * 	Helder Yesid Castrillón
 * 	Hisp Colombia 2014
 * 
 * Core Module for using WebApi of dhis2
 * It is the persistence in the FrontEnd
 * 
 * */

var Dhis2Api = angular.module("Dhis2Api", ['ngResource']);

var urlBase = window.location.href.split('/api/apps/')[0];
var urlApi = urlBase + '/api/';


//Auxiliary variable to parse the url
var urlAuxLink = document.createElement('a');
urlAuxLink.href = urlBase;

//Delete initial and final slash
var auxBaseUrl = urlAuxLink.pathname;
if (auxBaseUrl.startsWith("/")) auxBaseUrl = auxBaseUrl.substring(1);
if (auxBaseUrl.endsWith("/")) auxBaseUrl = auxBaseUrl.substring(0, auxBaseUrl.length - 2);

//Dhis related variables
window.dhis2 = window.dhis2 || {};
dhis2.settings = dhis2.settings || {};
dhis2.settings.baseUrl = auxBaseUrl;


var urlResource ={"vaccination":{url:"resources/vaccinationDataset.json"},
				"healthservice":{url:"resources/healthserviceSuffix.json"},
				"servicebysite":{url:"resources/servicesBySiteType.json"},
				"servicebyservicetype":{url:"resources/serviceByServiceType.json"}
				};
var Listperioddhis = [{code:'Daily',name:'PERIODTYPE_DAILY'},
					{code:'Weekly',name:'PERIODTYPE_WEEKLY'},
					{code:'Monthly',name:'PERIODTYPE_MONTHLY'},
					{ code: 'Yearly', name: 'PERIODTYPE_YEARLY' }];

var ougroupsetId = { ProjectType: "rQjuGZcxNxE" 
                    ,PopulationType: "iiFM3YudVxq" 
                    ,TypeManagement: "ZximACPowCs" 
                    ,Event: "DIYl9kZDij3" 
                    ,Context: "lR7GVB43jaX"
                    ,HealthService: "BtFXTpKRl6n"
                    ,HealthServiceType: "akYeq1mMz2N"
                    ,SiteType: "ZxNjaKVXY1D"};

var codeDataSets = {codeDSVacStaff:"DS_VST_3"
    				,codeDSDemographic:"DS_DEM"};

var levelMSF = {OperationalCenter: "2"
			 ,Mission: "3"
			 ,Project: "4"
			 ,HealthSite: "5"
			 ,HealthService: "6"};

var usersMSF = {prefix: "msfe",
			 postfix_mfp: "mfp",
			 postfix_fielduser: "user",
			 postfix_siteuser: "app",
			 postfix_onlineuser: "online",
			 uid_role_mfp: "gmOkgYI46ny",
			 uid_role_fielduser: "N4dxeOVu7aN",
			 uid_role_onlineuser: "mnIBssgDVSC",
			 passwd: "District123",
			 uid_project_users_userGroup: "EmlkqPJLcAh"};

var locales = ["en", "es", "fr", "pt"];
			

var prefixVaccination = { vaccinationName: 'Vaccination_', vaccinationCode: 'DS_VAC_' };
//Create all common variables of the apps 
Dhis2Api.factory("commonvariable", function () {
	var Vari={
			url: urlApi,
			urlbase: urlBase,
			codedatasets: codeDataSets,
			OrganisationUnitList:[],
			OrganisationUnit:"",
			RefreshTreeOU:false,
			NewOrganisationUnit: [],
			EditOrganisationUnit:{}, 
			orgUnitGroupSet:[],
			preOrgUnitGroupSet:[],
			urllocalresource:urlResource,
			Listperiod: Listperioddhis,
			prefixVaccination: prefixVaccination,
			DataElementSelected: [],
			VaccinationDatasetSelected: {},
			ouGroupsetId: ougroupsetId,
			level: levelMSF,
			OrganisationUnitParentConf: {},
		    ouDirective:"",
		    ouDirectiveCode: "",
		    userDirective:"",
		    users: usersMSF,
		    healhservicesCodeOUG: "",
		    refreshDataSets:false,
		    clearForm:[],
			locales: locales
			};

   return Vari; 
});

///local resources
Dhis2Api.factory("loadjsonresource",['$http','commonvariable', function($http,commonvariable) {
	 return {
        get: function (id) {
           return $http.get(commonvariable.urllocalresource[id].url);
         }
    };
}]);

/////resource of DHIS

Dhis2Api.constant("urlApi", urlApi);

Dhis2Api.factory("userAuthorization", ['$resource','commonvariable',function($resource,commonvariable) {
	return $resource(commonvariable.url + "me/authorization/:menuoption",
		{
			menuoption:'@menuoption'
		},
		{ get: { method: "GET", transformResponse: function (response) {return {status: response};}	}});

}]);

Dhis2Api.factory("uidDhis",['md5','commonvariable', function(md5,commonvariable) {
	 var get = function(name) {
        if (!name) return undefined;
        return "h" + md5.createHash(name.toLowerCase()).substring(0, 10);
    };

    return {
        "get": get
    };
}]);

Dhis2Api.factory("TreeOrganisationunit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits/:uid", 
   {
	uid:'@uid',
	fields: 'name,id,code,level,openingDate,shortName,closedDate,children[name,id,shortName,level,openingDate,closedDate,code,parent,dataSets[id,code,name]]'
   }, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("OrgUnit",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits/:id",
		{id:'@id',
		fields:'@fields'},
		{Get: { method: "GET"},
		    POST: { method: "POST" },
		  PUT: { method: "PUT"},
		  PATCH: {method: "PATCH"}});
}]);

Dhis2Api.factory("OrgUnitGroup",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnitGroups/:id",
		{id:'@id'},
		{Get: { method: "GET"},
		    POST: { method: "POST" },
		  PUT: { method: "PUT"},
		  PATCH: {method: "PATCH"}});
}]);


Dhis2Api.factory("User",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"users",
		{
			paging: false
		},
		{ POST: { method: "POST"} });
}]);

Dhis2Api.factory("OrgUnitGroupSet",['$resource','commonvariable', function ($resource,commonvariable) {
			
	return $resource(commonvariable.url+"organisationUnitGroupSets/:uid",
		{
		uid:'@uid',
		fields:'displayName~rename(name),id,code,organisationUnitGroups[id,code,displayName~rename(name)]'
		},
		{ get: { method: "GET"} });
}]);

Dhis2Api.factory("OrgUnitGroupByGroupSets",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"organisationUnitGroupSets/:uid",
		{	
		uid:'@uid',
		fields:'organisationUnitGroups'
		},
		{ get: { method: "GET"} });
}]);

Dhis2Api.factory("OrgUnitGroupByOrgUnit",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"organisationUnits/:uid",
		{	
		uid:'@uid',
		fields:'organisationUnitGroups[id,code,displayName~rename(name)]'
		},
		{ get: { method: "GET"} });
}]);


Dhis2Api.factory("OrgUnitGroupsOrgUnit",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"organisationUnitGroups/:uidgroup/organisationUnits/:uidorgunit",
		{	
		uidgroup:'@uidgroup',
		uidorgunit: '@uidorgunit'
		},
		{ POST: { method: "POST"},
		  DELETE: {method: "DELETE"}	
		});
}]);

Dhis2Api.factory("OrgUnitOrgUnitGroups",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"organisationUnits/:uidorgunit/organisationUnitGroups/:uidgroup",
		{	
		uidorgunit: '@uidorgunit',
		uidgroup:'@uidgroup'
		},
		{ POST: { method: "POST"},
		  DELETE: {method: "DELETE"}	
		});
}]);



Dhis2Api.factory("OrgUnitChildren",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"organisationUnits/:uid",
		{	
		uid:'@uid',
		fields:'children[id, name, code, level]'
		},
		{ GET: { method: "GET"} });
}]);

Dhis2Api.factory("DataElements",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"dataElements",
		{	
		filter:'@filter'
		},
		{ Get: { method: "GET"} });
}]);


Dhis2Api.factory("DataSets", ['$resource', 'commonvariable', function ($resource, commonvariable) {

    return $resource(commonvariable.url + "dataSets/:uid",
		{
		    uid: '@uid',
		    fields: ':all',
			paging: false
		},
		{   
			Get: { method:"GET" }, 
			Post: { method: "POST" }, 
			Put: { method: "PUT" }, 
			Patch: {method: "PATCH"}
		});
}]);

Dhis2Api.factory("Parent",  ['$resource', 'commonvariable', function ($resource, commonvariable) {
	
	return $resource(commonvariable.url + "organisationUnits/:uid",
			{
			uid:'@uid',
			fields:'parent'
			},
			{GET: {method: "GET"}});
		
}]);


Dhis2Api.factory("getIDOUG",  ['$resource', 'commonvariable', function ($resource, commonvariable) {
	
	return $resource(commonvariable.url + "organisationUnitGroups",
			{
			filter: '@filter',
			fields: 'id,displayName,name,code'
			},
			{GET: {method: "GET"}});
		
}]);

Dhis2Api.factory("FilterResource",  ['$resource', 'commonvariable', function ($resource, commonvariable) {
	
	return $resource(commonvariable.url + ":resource",
			{
			resource:'@resource',
			filter:'@filter'
			},
			{GET: {method: "GET"}});
		
}]);

Dhis2Api.factory("OrganisationUnitFind",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits?filter=:param",
		{
			param:'@param'
		},
		{ get: { method: "GET"} });
}]);

Dhis2Api.factory("DataSetsOrgUnit",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"organisationUnits/:uidorgunit/dataSets/:uiddataset",
		{	
		uidorgunit:'@uidorgunit',
		uiddataset: '@uiddataset'
		},
		{ POST: { method: "POST"},
		  GET: {method: "GET"},
		  DELETE: {method: "DELETE"}});
}]);

Dhis2Api.factory("UserRoles", ['$resource', 'commonvariable', function ($resource, commonvariable) {

    return $resource(commonvariable.url + "userRoles/:uid",
		{
		    uid: '@uid'
		},
		{   Get:{method:"GET"},
		Post: { method: "POST" },
		Put: { method: "PUT" },
		Patch: {method: "PATCH"}
		});
}]);


Dhis2Api.factory("DataSetUserRole",['$resource','commonvariable', function ($resource,commonvariable) {
	
	return $resource(commonvariable.url+"userRoles/:uiduserrole/dataSets/:uiddataset",
		{	
		uiduserrole:'@uiduserrole',
		uiddataset: '@uiddataset'
		},
		{ POST: { method: "POST"},
		  GET: {method: "GET"},
		  DELETE: {method: "DELETE"}});
}]);

Dhis2Api.factory("OrganisationUnitChildren",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits/:uid", 
   {
	uid:'@uid',
	//fields: 'name,id,code,level,openingDate,shortName',
	includeDescendants: 'true'
   }, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("GetMission",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"organisationUnits/:uid", 
   {
	uid:'@uid',
	fields: 'parent[parent[parent]]'
   }, 
  { get: { method: "GET"} });
}]);

Dhis2Api.factory("meUser", ['$resource', 'commonvariable', function ($resource, commonvariable) {
    return $resource(commonvariable.url + "me",
		{},
		{ get: { method: "GET" } });

}]);

Dhis2Api.factory("Section",['$resource','commonvariable', function ($resource,commonvariable) {
	return $resource(commonvariable.url+"sections/:id",
		{id:'@id'},
		{ Get: { method: "GET"},
	      Delete: {method: "DELETE"},
		  POST: { method: "POST" },
		  PUT: { method: "PUT"},
		  PATCH: {method: "PATCH"}});
}]);

Dhis2Api.factory("SystemId", ['$resource', 'commonvariable', function ($resource, commonvariable) {
	return $resource(commonvariable.url + "system/id")
}]);

Dhis2Api.factory("UserSettings", ['$resource', 'commonvariable', function($resource, commonvariable) {
	return $resource(commonvariable.url + "userSettings/:key?user=:user&value=:value",
		{
			key:'@key',
			user:'@user',
			value:'@value'
		});
}]);
