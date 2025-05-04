export interface GeoData {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    latitudeSpan?: number;
    longitudeSpan?: number;
}

export interface UsefulJsonKeys {
    timeCreated?: string; // photoTakenTime
    btime?: number; // file birth time
    timeModified?: string; // creationTime
    mtime?: number; // file modified time
    date?: string; // what is that -> maybe date of creation for the directories (albums)
    geoData?: GeoData;
    geoDataExif?: GeoData;
    archived?: boolean;
    locked?: boolean;
    trashed?: boolean;
    description?: string;
    url?: string;
    access?: string; // What is that ?!
    enrichments?: Object[];
}

export interface Dict {
    [temp1: string]: UsefulJsonKeys;
}

interface GoogleDate {
    timestamp: string;
    formatted: string;
}

export interface GooglePhotosMetadata {
    sharedAlbumComments?: Object;
    title?: string;
    description?: string;
    imageViews?: number;
    creationTime?: GoogleDate;
    photoTakenTime?: GoogleDate;
    date?: GoogleDate;
    geoData?: GeoData;
    geoDataExif?: GeoData;
    url?: string;
    googlePhotosOrigin?: Object;
    access?: string;
    enrichments?: any;
    archived?: boolean;
    favorited?: boolean;
    trashed?: boolean;
    inLockedFolder?: boolean;
    people?: string[];
}
