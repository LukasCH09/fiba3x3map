"use strict";
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Circle = void 0;
/* eslint-disable complexity */
var react_1 = require("react");
var react_google_maps_1 = require("@vis.gl/react-google-maps");
function useCircle(props) {
    var _a;
    var onClick = props.onClick, onDrag = props.onDrag, onDragStart = props.onDragStart, onDragEnd = props.onDragEnd, onMouseOver = props.onMouseOver, onMouseOut = props.onMouseOut, onRadiusChanged = props.onRadiusChanged, onCenterChanged = props.onCenterChanged, radius = props.radius, center = props.center, circleOptions = __rest(props, ["onClick", "onDrag", "onDragStart", "onDragEnd", "onMouseOver", "onMouseOut", "onRadiusChanged", "onCenterChanged", "radius", "center"]);
    // This is here to avoid triggering the useEffect below when the callbacks change (which happen if the user didn't memoize them)
    var callbacks = (0, react_1.useRef)({});
    Object.assign(callbacks.current, {
        onClick: onClick,
        onDrag: onDrag,
        onDragStart: onDragStart,
        onDragEnd: onDragEnd,
        onMouseOver: onMouseOver,
        onMouseOut: onMouseOut,
        onRadiusChanged: onRadiusChanged,
        onCenterChanged: onCenterChanged
    });
    var circle = (0, react_1.useRef)(new google.maps.Circle()).current;
    // update circleOptions (note the dependencies aren't properly checked
    // here, we just assume that setOptions is smart enough to not waste a
    // lot of time updating values that didn't change)
    circle.setOptions(circleOptions);
    (0, react_1.useEffect)(function () {
        if (!center)
            return;
        if (!(0, react_google_maps_1.latLngEquals)(center, circle.getCenter()))
            circle.setCenter(center);
    }, [center]);
    (0, react_1.useEffect)(function () {
        if (radius === undefined || radius === null)
            return;
        if (radius !== circle.getRadius())
            circle.setRadius(radius);
    }, [radius]);
    var map = (_a = (0, react_1.useContext)(react_google_maps_1.GoogleMapsContext)) === null || _a === void 0 ? void 0 : _a.map;
    // create circle instance and add to the map once the map is available
    (0, react_1.useEffect)(function () {
        if (!map) {
            if (map === undefined)
                console.error('<Circle> has to be inside a Map component.');
            return;
        }
        circle.setMap(map);
        return function () {
            circle.setMap(null);
        };
    }, [map]);
    // attach and re-attach event-handlers when any of the properties change
    (0, react_1.useEffect)(function () {
        if (!circle)
            return;
        // Add event listeners
        var gme = google.maps.event;
        [
            ['click', 'onClick'],
            ['drag', 'onDrag'],
            ['dragstart', 'onDragStart'],
            ['dragend', 'onDragEnd'],
            ['mouseover', 'onMouseOver'],
            ['mouseout', 'onMouseOut']
        ].forEach(function (_a) {
            var eventName = _a[0], eventCallback = _a[1];
            gme.addListener(circle, eventName, function (e) {
                var callback = callbacks.current[eventCallback];
                if (callback)
                    callback(e);
            });
        });
        gme.addListener(circle, 'radius_changed', function () {
            var _a, _b;
            var newRadius = circle.getRadius();
            (_b = (_a = callbacks.current).onRadiusChanged) === null || _b === void 0 ? void 0 : _b.call(_a, newRadius);
        });
        gme.addListener(circle, 'center_changed', function () {
            var _a, _b;
            var newCenter = circle.getCenter();
            (_b = (_a = callbacks.current).onCenterChanged) === null || _b === void 0 ? void 0 : _b.call(_a, newCenter);
        });
        return function () {
            gme.clearInstanceListeners(circle);
        };
    }, [circle]);
    return circle;
}
/**
 * Component to render a Google Maps Circle on a map
 */
exports.Circle = (0, react_1.forwardRef)(function (props, ref) {
    var circle = useCircle(props);
    (0, react_1.useImperativeHandle)(ref, function () { return circle; });
    return null;
});
