export type Location = {
    registrationIsOpen: boolean;
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    city: string;
    cityCountryIso2: string;
    imageTinyUrl?: string;
    imageSmallUrl?: string;
    imageMediumUrl?: string;
    key?: string;
    lat?: number;
    lng?: number;
};


export type Marker = {
    registrationIsOpen: boolean;
    lat: number;
    lng: number;
    id: string;
    name: string;
    city: string;
    cityCountryIso2: string;
    startDate: string;
    endDate: string;
    imageTinyUrl?: string;
    imageSmallUrl?: string;
    imageMediumUrl?: string;
};