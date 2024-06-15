import {Location} from "./types";
import React from "react";

export function getCoordinates(location: Location, setLocationsWithKey: React.Dispatch<React.SetStateAction<Location[]>>) {
    const encodedAddress = encodeURIComponent(location.city);
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=GOOGLE_MAPS_API_KEY`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.results.length > 0) {
                const updatedLocation = {
                    ...location,
                    lat: data.results[0].geometry.location.lat,
                    lng: data.results[0].geometry.location.lng
                };
                setLocationsWithKey(prevLocations => prevLocations.map(loc => loc.id === location.id ? updatedLocation : loc));
                return updatedLocation;
            } else {
                return location; // Return the original location if no results were found
            }
        });
}