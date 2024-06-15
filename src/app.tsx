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

import React, {useEffect, useState} from 'react';
import {createRoot} from "react-dom/client";
import {AdvancedMarker, APIProvider, Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';
import {Location, Marker} from './types';
import "react-datepicker/dist/react-datepicker.css";
import {InfoWindow} from '@react-google-maps/api';
import {createGlobalStyle} from 'styled-components';

import jsonData from './geoEvents.json';
import {
    Avatar,
    Container,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {countryCodes} from "./countryCodes";
import {getCoordinates} from "./getCoordinates";

const GlobalStyle = createGlobalStyle`
    body, html {
        margin: 0;
        padding: 0;
        overflow: hidden;
        width: 100%;
    }
`;

async function fetchIPGeolocation(apiToken: string | undefined) {
    const response = await fetch('https://ipinfo.io?token=' + apiToken);
    const data = await response.json();
    return {
        lat: parseFloat(data.loc.split(',')[0]),
        lng: parseFloat(data.loc.split(',')[1])
    };
}

async function fetchEvents() {
    let pageNum = 1;
    let nextPageNum;
    let numPagesToLoad = 0;
    let allResults = [];

    // Read the file and parse the JSON data
    // const jsonData = JSON.parse(data);
    const fileEventCount = jsonData.results.length;

    // Initial fetch request to get totalCount
    const initialResponse = await fetch(`/api/v2/search/events?name=&input=&when=future&distance=1000&pageNum=${pageNum}`);
    const initialJson = await initialResponse.json();
    allResults.push(...initialJson.results);
    nextPageNum = initialJson.nextPageNum;

    while (nextPageNum && numPagesToLoad > 0) {
        numPagesToLoad--;
        const response = await fetch(`/api/v2/search/events?name=&input=&when=future&distance=1000&pageNum=${pageNum}`);
        const json = await response.json();
        allResults.push(...json.results);
        const locations = JSON.parse(JSON.stringify(json.results));
        nextPageNum = json.nextPageNum; // Get the nextPageNum from the response
        locations.map((location: { city: any; }) => ({
            ...location,
            key: location.city
        }));
        pageNum = nextPageNum; // Set pageNum to nextPageNum for the next iteration
    }

    if (numPagesToLoad > -1) {

        // Create a blob from the JSON data
        const blob = new Blob([JSON.stringify(allResults, null, 2)], {type: 'application/json'});

        // Create a link element
        const link = document.createElement("a");

        // Set the download attribute of the link
        link.download = "./events.json";

        // Create a URL for the link
        link.href = URL.createObjectURL(blob);

        // Append the link to the document
        document.body.appendChild(link);

        // Simulate a click on the link
        link.click();

        // Remove the link from the document
        document.body.removeChild(link);
    }
}

const App = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 6)));
    const [country, setCountry] = useState('All');
    const [countries, setCountries] = useState<string[]>([]);

    const [markers, setMarkers] = useState<Marker[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
    const [visibleMarkers, setVisibleMarkers] = useState<Marker[]>([]);
    const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | undefined>(undefined);
    const [locationsWithKey, setLocationsWithKey] = useState<Location[]>([]);
    const [mapCenter, setMapCenter] = useState<null | { lat: number, lng: number }>(null);

    const [hasFetchedCoordinates, setHasFetchedCoordinates] = useState(true);
    const shouldFetchEvents = false;
    const shouldFetchCoordinates = true;

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const apiToken = process.env.IPINFO_TOKEN;

    console.log("App")

    useEffect(() => {
            fetchIPGeolocation(apiToken).then(setMapCenter).catch(console.error);
        }
        , []);

    useEffect(() => {
        if (shouldFetchEvents) {
            fetchEvents();
        }

        fetch('./src/geoEvents_full.json', {
            headers: {
                'Cache-Control': 'no-cache'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const uniqueIds = new Set();
                const locations = JSON.parse(JSON.stringify(data.results))
                    .filter((event: { id: unknown; }) => {
                        if (uniqueIds.has(event.id)) {
                            return false;
                        } else {
                            uniqueIds.add(event.id);
                            return true;
                        }
                    })
                    .filter((location: {
                        cityCountryIso2: string;
                    }) => country === 'All' || location.cityCountryIso2 === country);
                // .filter((event: { registrationIsOpen: boolean; }) => event.registrationIsOpen);

                const newLocationsWithKey = locations.map((location: { city: any; }) => {
                    let city = location.city;
                    if (city.includes("Vienna, Vienna")) {
                        city = city.replace("Vienna, Vienna", "Vienna");
                    }
                    return ({
                        ...location,
                        city: city,
                        key: city + Math.floor(Math.random() * 1000)
                    });
                });

                let uniqueCountries: string[] = Array.from(new Set(newLocationsWithKey.map((item: any) => item.cityCountryIso2)), x => x as string);
                setCountries(uniqueCountries as string[]);
                console.log(uniqueCountries.filter((countryCode: string) => !(countryCode in countryCodes)));

                // Define the start and end indices of the subset
                const start = 0;
                const end = 2000; // Change this to the number of elements you want to copy

                // Use the slice method to get a subset of newLocationsWithKey
                const subset = newLocationsWithKey.slice(start, end);
                setLocationsWithKey(subset);
            })
            .catch(error => console.error('Parse error:', error));
    }, [country]);

    useEffect(() => {
        if (locationsWithKey.length > 0 && !hasFetchedCoordinates) {
            setHasFetchedCoordinates(true);
            Promise.all(locationsWithKey.map(location => getCoordinates(location, setLocationsWithKey)))
                .then(updatedLocations => {
                    const newMarkers = updatedLocations
                        .filter(location => typeof location.lat === 'number' && typeof location.lng === 'number')
                        .filter(location => new Date(location.startDate) >= startDate && new Date(location.endDate) <= endDate)
                        .map(location => ({
                            registrationIsOpen: location.registrationIsOpen,
                            lat: location.lat as number,
                            lng: location.lng as number,
                            id: location.id,
                            name: location.name,
                            startDate: location.startDate,
                            endDate: location.endDate,
                            city: location.city,
                            cityCountryIso2: location.cityCountryIso2
                        }));
                    if (JSON.stringify(newMarkers) !== JSON.stringify(markers)) {
                        setMarkers(newMarkers);
                    }
                    // Create a blob from the JSON data
                    const blob = new Blob([JSON.stringify(updatedLocations, null, 2)], {type: 'application/json'});

                    // Create a link element
                    const link = document.createElement("a");

                    // Set the download attribute of the link
                    link.download = "geoEvents.json";

                    // Create a URL for the link
                    link.href = URL.createObjectURL(blob);

                    // Append the link to the document
                    document.body.appendChild(link);

                    // Simulate a click on the link
                    link.click();

                    // Remove the link from the document
                    document.body.removeChild(link);
                })
                .catch(console.error);
        } else {
            // console.log('else if');
            const newMarkers = locationsWithKey
                .filter(location => typeof location.lat === 'number' && typeof location.lng === 'number')
                .filter(location => new Date(location.startDate) >= startDate && new Date(location.endDate) <= endDate)
                .map(location => ({
                    registrationIsOpen: location.registrationIsOpen,
                    lat: location.lat as number,
                    lng: location.lng as number,
                    id: location.id,
                    name: location.name,
                    startDate: location.startDate,
                    endDate: location.endDate,
                    city: location.city,
                    cityCountryIso2: location.cityCountryIso2,
                    imageTinyUrl: location.imageTinyUrl,
                    imageSmallUrl: location.imageSmallUrl,
                    imageMediumUrl: location.imageMediumUrl
                }));
            if (JSON.stringify(newMarkers) !== JSON.stringify(markers)) {
                setMarkers(newMarkers);
            }
        }
    }, [locationsWithKey, hasFetchedCoordinates, startDate, endDate]);

    if (markers.length === 0) {
        return <div>Loading...</div>;
    }

    const updateVisibleMarkers = () => {
        if (mapBounds) {
            const ne = mapBounds.getNorthEast();
            const sw = mapBounds.getSouthWest();
            const newVisibleMarkers = markers.filter(marker =>
                marker.lat <= ne.lat() &&
                marker.lat >= sw.lat() &&
                marker.lng <= ne.lng() &&
                marker.lng >= sw.lng()
            );
            setVisibleMarkers(newVisibleMarkers);
        }
    };

    const formatDate = (date: Date) => {
        const day = ("0" + date.getDate()).slice(-2);
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
    };

    if (!apiKey) {
        throw new Error("Google Maps API key is not set in the environment variables");
    }

    return (
        <APIProvider apiKey={apiKey}
                     onLoad={() => console.log('Maps API has loaded.')}>
            <GlobalStyle/>

            <div style={{margin: 0, padding: 0}}>
                <Container>
                    <Typography variant="h2">FIBA 3x3 Map</Typography>
                    <TextField
                        id="date"
                        label="Start Date"
                        type="date"
                        defaultValue={formatDate(startDate)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={(e) => {
                            setStartDate(new Date(e.target.value));
                            updateVisibleMarkers();
                        }}
                    />
                    <TextField
                        id="date"
                        label="End Date"
                        type="date"
                        defaultValue={formatDate(endDate)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onChange={(e) => {
                            setEndDate(new Date(e.target.value));
                            updateVisibleMarkers();
                        }}
                    />
                    <Select
                        value={country}
                        onChange={(e) => setCountry(e.target.value as string)}
                    >
                        <MenuItem value="All">All</MenuItem>
                        {countries.map((countryCode, index) => (
                            <MenuItem key={index} value={countryCode}>{countryCodes[countryCode]}</MenuItem>
                        ))}
                    </Select>
                </Container>
            </div>
            <div style={{display: 'flex', height: '85vh', width: '100vw', paddingLeft: 0, paddingRight: 10}}>
                {mapCenter && (<Map
                        style={{width: '70%', height: '100%'}}
                        defaultZoom={9}
                        defaultCenter={mapCenter}
                        mapId={'b1b2'}
                        onIdle={(event) => {
                            setMapBounds(event.map.getBounds());
                            updateVisibleMarkers();
                        }}
                        onCameraChanged={(ev: MapCameraChangedEvent) => {
                            console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
                            updateVisibleMarkers();
                        }}>
                        {markers.map((marker: Marker) => (
                            <AdvancedMarker key={marker.id}
                                            position={marker}
                                            onClick={() => setSelectedMarker(marker)}
                            />
                        ))}

                        {selectedMarker && (
                            <InfoWindow
                                position={{lat: selectedMarker.lat, lng: selectedMarker.lng}}
                                onCloseClick={() => setSelectedMarker(null)}
                            >
                                <p>
                                    <strong>{selectedMarker.name}</strong>
                                </p>
                            </InfoWindow>
                        )}
                    </Map>
                )}

                <List style={{
                    width: '30%',
                    height: '100%',
                    // maxWidth: 360,
                    overflowY: 'auto',
                    color: 'background.paper',
                    paddingRight: 10
                }}>
                    {visibleMarkers.map((marker: Marker) => (
                        <div key={marker.id}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar style={{paddingTop: 12}}>
                                    <Avatar
                                        alt={marker.name}
                                        src={marker.imageTinyUrl ? marker.imageTinyUrl : "https://seeklogo.com/images/1/3x3-fiba-logo-8E30FF6692-seeklogo.com.png"}
                                    />
                                </ListItemAvatar>
                                <ListItemText style={{display: 'inline', paddingTop: 0}}
                                              secondary={
                                                  <React.Fragment>
                                                      <Typography
                                                          style={{display: 'inline'}}
                                                          component="span"
                                                          variant="body2"
                                                          color="textPrimary"
                                                      >
                                                          <strong>
                                                              <a href={`https://play.fiba3x3.com/events/${marker.id}`}>
                                                                  {marker.name}
                                                              </a>
                                                          </strong>
                                                      </Typography>
                                                      <div className="row">
                                                          <div className="column" style={{float: "left", width: "50%"}}>
                                                              <p style={{lineHeight: 0.5}}>City: {marker.city}</p>
                                                              <p style={{lineHeight: 0.5}}>Country: {countryCodes[marker.cityCountryIso2]}</p>
                                                              <p style={{lineHeight: 0.5}}>Registration
                                                                  Open: {marker.registrationIsOpen ? 'Yes' : 'No'}</p>
                                                          </div>
                                                          <div className="column" style={{float: "left", width: "50%"}}>
                                                              <p style={{lineHeight: 0.5}}>
                                                                  Start
                                                                  Date: {new Date(marker.startDate).toISOString().split('T')[0]}
                                                              </p>
                                                              <p style={{lineHeight: 0.5}}>
                                                                  End
                                                                  Date: {new Date(marker.endDate).toISOString().split('T')[0]}
                                                              </p>
                                                          </div>
                                                      </div>
                                                  </React.Fragment>
                                              }
                                />
                            </ListItem>
                            <Divider variant="inset" component="li"/>

                            {/*<p>Start Date: {new Date(marker.startDate).toISOString().split('T')[0]}</p>*/}
                            {/*<p>End Date: {new Date(marker.endDate).toISOString().split('T')[0]}</p>*/}
                        </div>
                    ))}
                </List>
            </div>

        </APIProvider>
    );
};

const appElement = document.getElementById('app');
if (!appElement) {
    throw new Error("Could not find element with id 'app'");
}

const root = createRoot(appElement);
root.render(<App/>);

export default App;