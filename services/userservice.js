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

Dhis2Api.service('UserService', ['$q', 'commonvariable', 'SystemId', 'User', function ($q, commonvariable, SystemId, User) {

    var createProjectUsers = function (project, commonName) {
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

            return saveUser(user);
        });

        return $q.all(userPromises);
    };
    
    var getOrgUnitUsers = function (orgUnit) {
        var params = {
            fields: "id,displayName,userCredentials[username,userRoles[id,displayName]]",
            filter: "organisationUnits.id:eq:" + orgUnit.id
        };
        return User.get(params).$promise;
    };

    function saveUser (user) {
        return SystemId.get().$promise.then(function (data) {
            var userId = data.codes[0];
            user.id = userId;
            user.userCredentials.userInfo = {"id": userId};
            console.log("Creating user: " + user.userCredentials.username);
            return User.POST(user).$promise;
        });
    }
    
    return {
        createProjectUsers: createProjectUsers,
        getOrgUnitUsers: getOrgUnitUsers
    }
}]);