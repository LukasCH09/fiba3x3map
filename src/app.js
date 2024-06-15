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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var client_1 = require("react-dom/client");
var react_google_maps_1 = require("@vis.gl/react-google-maps");
var events_json_1 = __importDefault(require("./events.json"));
function getCoordinates(location) {
    console.log("getCoordinates: " + location);
    var encodedAddress = encodeURIComponent(location.city);
    return fetch("https://maps.googleapis.com/maps/api/geocode/json?address=".concat(encodedAddress, "&key=AIzaSyDHQaJ9P1dpuLDvfugXwml8OXU3koevLVA"))
        .then(function (response) {
        if (!response.ok) {
            throw new Error("HTTP error! status: ".concat(response.status));
        }
        return response.json();
    })
        .then(function (data) {
        return __assign(__assign({}, location), data.results[0].geometry.location);
    });
}
var App = function () {
    var totalCount = 1564;
    console.log("App");
    var _a = (0, react_1.useState)([]), locationsWithKey = _a[0], setLocationsWithKey = _a[1];
    var fetchEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
        var pageNum, nextPageNum, totalCount, fileEventCount, initialResponse, initialJson, _loop_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pageNum = 1;
                    fileEventCount = events_json_1.default.results.length;
                    return [4 /*yield*/, fetch("https://play.fiba3x3.com/api/v2/search/events?name=&input=&when=future&distance=1000&pageNum=".concat(pageNum))];
                case 1:
                    initialResponse = _a.sent();
                    return [4 /*yield*/, initialResponse.json()];
                case 2:
                    initialJson = _a.sent();
                    totalCount = initialJson.totalCount;
                    console.log("Total count: " + totalCount);
                    // If the number of events in the file is the same as totalCount, return immediately
                    if (fileEventCount === totalCount) {
                        return [2 /*return*/];
                    }
                    _loop_1 = function () {
                        var response, json, locations, newLocationsWithKey;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, fetch("https://play.fiba3x3.com/api/v2/search/events?name=&input=&when=future&distance=1000&pageNum=".concat(pageNum))];
                                case 1:
                                    response = _b.sent();
                                    return [4 /*yield*/, response.json()];
                                case 2:
                                    json = _b.sent();
                                    locations = JSON.parse(JSON.stringify(json.results));
                                    nextPageNum = json.nextPageNum; // Get the nextPageNum from the response
                                    newLocationsWithKey = locations.map(function (location) { return (__assign(__assign({}, location), { key: location.city })); });
                                    setLocationsWithKey(function (prevLocations) { return __spreadArray(__spreadArray([], prevLocations, true), newLocationsWithKey, true); });
                                    pageNum = nextPageNum; // Set pageNum to nextPageNum for the next iteration
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 3;
                case 3: return [5 /*yield**/, _loop_1()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (nextPageNum && locationsWithKey.length < totalCount) return [3 /*break*/, 3];
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        fetchEvents();
    }, []);
    fetch('events.json')
        .then(function (response) { return response.json(); })
        .then(function (data) {
        var locations = JSON.parse(JSON.stringify(data.results));
        var newLocationsWithKey = locations.map(function (location) { return (__assign(__assign({}, location), { key: location.city })); });
        setLocationsWithKey(newLocationsWithKey);
    })
        .catch(function (error) { return console.error('Parse error:', error); });
    var _b = (0, react_1.useState)([]), markers = _b[0], setMarkers = _b[1];
    (0, react_1.useEffect)(function () {
        if (locationsWithKey.length > 0 && markers.length === 0) {
            Promise.all(locationsWithKey.map(function (location) { return getCoordinates(location); }))
                .then(setMarkers)
                .catch(console.error);
        }
    }, [locationsWithKey, markers]);
    if (markers.length === 0) {
        return react_1.default.createElement("div", null, "Loading...");
    }
    return (react_1.default.createElement(react_google_maps_1.APIProvider, { apiKey: 'AIzaSyDHQaJ9P1dpuLDvfugXwml8OXU3koevLVA', onLoad: function () { return console.log('Maps API has loaded.'); } },
        react_1.default.createElement("h1", null, "Hello, world!2"),
        react_1.default.createElement(react_google_maps_1.Map, { defaultZoom: 13, defaultCenter: markers[0], mapId: 'b1b2', onCameraChanged: function (ev) {
                return console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
            } }, markers.map(function (marker) { return (react_1.default.createElement(react_google_maps_1.AdvancedMarker, { key: marker.id, position: marker })); }))));
};
var appElement = document.getElementById('app');
if (!appElement) {
    throw new Error("Could not find element with id 'app'");
}
var root = (0, client_1.createRoot)(appElement);
root.render(react_1.default.createElement(App, null));
exports.default = App;
