/**!
 *
 *  Copyright 2015 Netflix, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */
 (function () {
     'use strict';

     /**
     * @name FlameGraphService
     */
     function FlameGraphService($log, $rootScope, $http, flash) {

        /**
        * @name generate
        * @desc
        */
        function generate() {
            $http.get("http://" + $rootScope.properties.host + ":" + $rootScope.properties.port + "/pmapi/" + $rootScope.properties.context + "/_fetch?names=generic.systack")
                .success(function () {
                    flash.to('alert-sysstack-success').success = 'generic.systack requested!';
                    $log.info("generic.systack requested");
                }).error(function () {
                    flash.to('alert-sysstack-error').error = 'failed requesting generic.systack!';
                    $log.error("failed requesting generic.systack");
                });
        }

        //////////
        
        return {
            generate: generate
        };
    }

    angular
        .module('app.services')
        .factory('FlameGraphService', FlameGraphService);

 })();
