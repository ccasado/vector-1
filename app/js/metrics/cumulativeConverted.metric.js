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
    * @name CumulativeConvertedMetric
    * @desc
    */
    function CumulativeConvertedMetric($rootScope, $log, Metric, MetricService) {

        var CumulativeConvertedMetric = function (name, conversionFunction) {
            this.base = Metric;
            this.base(name);
            this.conversionFunction = conversionFunction;
        };

        CumulativeConvertedMetric.prototype = new Metric();

        CumulativeConvertedMetric.prototype.pushValue = function (timestamp, iid, iname, value) {
            var self = this,
                instance,
                overflow,
                diffValue,
                convertedValue;

            instance = _.find(self.data, function (el) {
                return el.iid === iid;
            });

            if (angular.isUndefined(instance)) {
                instance = {
                    key: angular.isDefined(iname) ? iname : this.name,
                    iid: iid,
                    values: [],
                    previousValue: value,
                    previousTimestamp: timestamp
                };
                self.data.push(instance);
            } else {
                diffValue = ((value - instance.previousValue) / (timestamp - instance.previousTimestamp)); // sampling frequency
                convertedValue = self.conversionFunction(diffValue);
                instance.values.push({ x: timestamp, y: convertedValue });
                instance.previousValue = value;
                instance.previousTimestamp = timestamp;
                overflow = instance.values.length - (($rootScope.properties.window * 60) / $rootScope.properties.interval);
                if (overflow > 0) {
                    instance.values.splice(0, overflow);
                }
            }
        };

        CumulativeConvertedMetric.prototype.pushValues = function (iid, timestamp, value) {
            var self = this,
                instance,
                overflow,
                diffValue,
                convertedValue;

            instance = _.find(self.data, function (el) {
                return el.iid === iid;
            });

            if (angular.isUndefined(instance)) {
                instance = {
                    key: 'Series ' + iid,
                    iid: iid,
                    values: [],
                    previousValue: value,
                    previousTimestamp: timestamp
                };
                self.data.push(instance);

                MetricService.getInames(self.name, iid)
                    .then(function (response) {
                        $.each(response.data.instances, function (index, value) {
                            if (value.instance === iid) {
                                instance.key = value.name;
                            }
                        });
                    });
            } else {
                diffValue = ((value - instance.previousValue) / (timestamp - instance.previousTimestamp)); // sampling frequency
                convertedValue = self.conversionFunction(diffValue);
                instance.values.push({ x: timestamp, y: convertedValue });
                instance.previousValue = value;
                instance.previousTimestamp = timestamp;
                overflow = instance.values.length - (($rootScope.properties.window * 60) / $rootScope.properties.interval);
                if (overflow > 0) {
                    instance.values.splice(0, overflow);
                }
            }
        };

        return CumulativeConvertedMetric;
    }

    angular
        .module('app.metrics')
        .factory('CumulativeConvertedMetric', CumulativeConvertedMetric);
 })();
