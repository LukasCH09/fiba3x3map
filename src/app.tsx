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
import {createGlobalStyle} from 'styled-components';

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

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    overflow: hidden;
    //width: 90%;
    height: 100%;
  }

  .css-h4y409-MuiList-root {
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }

  *, *::before, *::after {
    box-sizing: border-box; /* Includes padding and border in the element's total width and height */
  }

  body > div:first-child {
    max-width: 100%;
    max-height: 100vh; /* Adjust based on your needs */
    //overflow: auto; /* Allows scrolling within the div if content is larger than the div */
  }
  
  .header {
    margin: 0;
    padding: 0;
    height: 15vh;
    width: 100vw;
  }

  .container {
    display: flex;
    flex-direction: row;
    height: calc(100vh - 15vh); /* Adjust the height to use the freed upper space */
    width: 100vw;
    padding-left: 0;
    padding-right: 0;
  }

  .map {
    flex: 1;
    height: 100%;
  }

  .events-list {
    width: 30%;
    height: 100%;
    overflow-y: auto;
    color: background.paper;
    padding-right: 0;
  }

  @media (max-width: 768px) {

    .header {
      margin: 0;
      padding: 0;
      height: 12vh;
      width: 100vw;
    }
    
    .container {
      flex-direction: column;
      height: calc(100vh - 13vh); /* Adjust the height for small screens */
    }

    .events-list {
      width: 100%;
      height: 90%;
    }

    .title {
      font-size: 1.5rem; /* Adjust the font size for small screens */
    }

    .MuiTextField-root, .MuiSelect-root {
      font-size: 0.5rem; /* Adjust the font size for the fields */
      width: 40%; /* Make the fields take full width */
    }

    .MuiListItemText-root {
      font-size: 0.25rem; /* Adjust the font size for ListItemText on small screens */
    }

    .css-hhvo2v-MuiListItem-root {
      padding-right: 5px; 
      padding-left: 10px;
    }

    .css-1m6607n-MuiListItemAvatar-root {
      min-width: 50px;
    }

    .css-1sra7t5-MuiTypography-root {
      margin-bottom: 5px;
      padding-bottom: 10px;
    }

    .css-1oqqzyl-MuiContainer-root {
      padding-left: 7px;
      padding-right: 7px;
    }
  }
`;

async function fetchIPGeolocation(apiToken: string | undefined) {
  return {
    lat: 46.98150140463602,
    lng: 7.4022910022450334
  };
}

const App = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 12)));
  const [country, setCountry] = useState('All');
  const [countries, setCountries] = useState<string[]>([]);

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [visibleMarkers, setVisibleMarkers] = useState<Marker[]>([]);
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | undefined>(undefined);
  const [locationsWithKey, setLocationsWithKey] = useState<Location[]>([]);
  const [mapCenter, setMapCenter] = useState<null | { lat: number, lng: number }>(null);

  const [hasFetchedCoordinates, setHasFetchedCoordinates] = useState(true);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const apiToken = process.env.IPINFO_TOKEN;

  console.log("App")

  useEffect(() => {
        fetchIPGeolocation(apiToken).then(setMapCenter).catch(console.error);
      }
      , []);

  useEffect(() => {

    fetch('./geoEvents.json', {
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
      const locations = JSON.parse(JSON.stringify(data))
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
      const end = 3000; // Change this to the number of elements you want to copy

      // Use the slice method to get a subset of newLocationsWithKey
      const subset = newLocationsWithKey.slice(start, end);
      setLocationsWithKey(subset);
    })
    .catch(error => console.error('Parse error:', error));
  }, [country]);

  useEffect(() => {
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
                   onLoad={() => {
                     console.log('Maps API has loaded.');
                     setMapBounds(mapBounds);
                     updateVisibleMarkers()
                   }}>
        <GlobalStyle/>

        <div className="header">
          <Container>
            <Typography variant="h2" className="title">FIBA 3x3 Map</Typography>
            <TextField
                id="date"
                label="Start Date"
                size="small"
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
                size="small"
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
                label="Country"
                size="small"
                value={country}
                onChange={(e) => setCountry(e.target.value as string)}
            ><label>Country</label>
              <MenuItem value="All">All</MenuItem>
              {countries.map((countryCode, index) => (
                  <MenuItem key={index} value={countryCode}>{countryCodes[countryCode]}</MenuItem>
              ))}
            </Select>
          </Container>
        </div>
        <div className="container">
          {mapCenter && (<Map
                  defaultZoom={9}
                  defaultCenter={mapCenter}
                  mapId={'b1b2'}
                  onIdle={(event) => {
                    setMapBounds(event.map.getBounds());
                    updateVisibleMarkers();
                  }}
                  onCameraChanged={(ev: MapCameraChangedEvent) => {
                    console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
                    setMapBounds(ev.map.getBounds());
                    updateVisibleMarkers();
                  }}>
                {markers.map((marker: Marker) => (
                    <AdvancedMarker key={marker.id}
                                    position={marker}
                                    onClick={() => setSelectedMarker(marker)}
                    />
                ))}
              </Map>
          )}

          <List className="events-list">
            {visibleMarkers.map((marker: Marker) => (
                <div key={marker.id}>
                  <ListItem alignItems="flex-start" style={{paddingTop: 0, paddingBottom: 0}}>
                    <ListItemAvatar style={{paddingTop: 12}}>
                      <Avatar
                          alt={marker.name}
                          src={marker.imageTinyUrl ? marker.imageTinyUrl : "https://seeklogo.com/images/1/3x3-fiba-logo-8E30FF6692-seeklogo.com.png"}
                      />
                    </ListItemAvatar>
                    <ListItemText style={{display: 'inline', padding: 0}}
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
                                      <span className="row">
                                        <span className="column"
                                             style={{float: "left", width: "50%"}}>
                                          <span>City: {marker.city}</span><br/>
                                          <span>Country: {countryCodes[marker.cityCountryIso2]}</span><br/>
                                          <span>Registration
                                            Open: {marker.registrationIsOpen ? 'Yes' : 'No'}</span>
                                        </span>
                                        <span className="column"
                                             style={{float: "left", width: "50%"}}>
                                          <span>
                                            Start
                                            Date: {new Date(marker.startDate).toISOString().split('T')[0]}
                                          </span><br/>
                                          <span>
                                            End
                                            Date: {new Date(marker.endDate).toISOString().split('T')[0]}
                                          </span><br/>
                                        </span>
                                      </span>
                                    </React.Fragment>
                                  }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li"/>
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