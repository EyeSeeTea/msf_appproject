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

Dhis2Api.service('UserService', ['$q', 'commonvariable', 'SystemId', 'User', 'UserSettings', function ($q, commonvariable, SystemId, User, UserSettings) {

    const DEFAULT_LANG = 'en';

    var createProjectUsers = function (project, commonName, language) {
        var userPromises = (Array.apply(null, {length: 11})).map(function (elem, index) {
            var isMFP = index == 0;

            var firstName = isMFP ? commonvariable.users.postfix_mfp : commonvariable.users.postfix_fielduser + index;
            var userRoles = isMFP ? commonvariable.users.uid_role_mfp : commonvariable.users.uid_role_fielduser;
            var userName = commonvariable.users.prefix + "-" + commonName + "-" + firstName;

            var user = {
                firstName: firstName,
                surname: commonName[0].toUpperCase() + commonName.slice(1), // Capitalize surname
                userCredentials: {
                    userRoles: [{"id": userRoles}],
                    username: userName,
                    password: commonvariable.users.passwd
                },
                organisationUnits: [{"id": project.id}],
                dataViewOrganisationUnits: [{"id": project.id}],
                userGroups: [{"id": commonvariable.users.uid_project_users_userGroup}]
            };

            return saveUser(user, language || DEFAULT_LANG);
        });

        return $q.all(userPromises);
    };
    
    var createOnlineUsers = function (project, commonName, language, password) {
        var onlineUserPromises = (Array.apply(null, {length: 3})).map(function (elem, index) {
            var firstName = commonvariable.users.postfix_onlineuser + (index + 1);
            var user = {
                firstName: firstName[0].toUpperCase() + firstName.slice(1),
                surname: commonName[0].toUpperCase() + commonName.slice(1),
                userCredentials: {
                    userRoles: [{"id": commonvariable.users.uid_role_onlineuser}],
                    username: commonvariable.users.prefix + "-" + commonName + "-" + firstName,
                    password: password || commonvariable.users.passwd
                },
                organisationUnits: [{"id": project.id}],
                dataViewOrganisationUnits: [{"id": project.id}]
                // TODO Assign to capital users in the mission?
            };
            
            return saveUser(user, language || DEFAULT_LANG);
        });
        
        return $q.all(onlineUserPromises);
    };
    
    var getOrgUnitUsers = function (orgUnit) {
        var params = {
            fields: "id,displayName,userCredentials[username,userRoles[id,displayName]]",
            filter: "organisationUnits.id:eq:" + orgUnit.id
        };
        return User.get(params).$promise;
    };

    function saveUser (user, language) {
        return SystemId.get().$promise.then(function (data) {
            var userId = data.codes[0];
            user.id = userId;
            user.userCredentials.userInfo = {"id": userId};
            return User.POST(user).$promise;
        }).then(function (response) {
            if (response.status == "OK") {
                console.log("Created user: " + user.userCredentials.username);
                return saveUserLanguage(user.userCredentials.username, language);
            } else {
                return $q.reject("Error while creating user " + user.userCredentials.username);
            }
        });
    }

    function saveUserLanguage (username, language) {
        var keyUiLocale = {
            key: 'keyUiLocale',
            user: username,
            value: language
        }
        var keyDbLocale = {
            key: 'keyDbLocale',
            user: username,
            value: language
        }

        return UserSettings.save(keyUiLocale, {}).$promise
            .then(function success() {
                return UserSettings.save(keyDbLocale, {}).$promise;
            });
    }
    
    return {
        createProjectUsers: createProjectUsers,
        createOnlineUsers: createOnlineUsers,
        getOrgUnitUsers: getOrgUnitUsers
    }
}]);