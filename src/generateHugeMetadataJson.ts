import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Dirent } from 'node:fs';
import { Dict, GooglePhotosMetadata } from './types.js';
import traverseTakeoutPaths from './helpers/traverseTakeoutPaths.js';

const dict: Dict = {};

// const ignoredKeys = [
//     'favored',
//     'imageViews',
//     'people',
//     'sharedAlbumComments',
//     'googlePhotosOrigin',
// ]

enum MonthsMap {
    'janv.' = 'January',
    'févr.' = 'February',
    'mars' = 'March',
    'avr.' = 'April',
    'mai' = 'May',
    'juin' = 'June',
    'juil.' = 'July',
    'août' = 'August',
    'sept.' = 'September',
    'oct.' = 'October',
    'nov.' = 'November',
    'déc.' = 'December',
}

const traverse = async (inputPath: string) => {
    try {
        const files: Dirent[] = await readdir(inputPath, {
            withFileTypes: true,
        });

        const dirPaths: string[] = [];

        for (const dirent of files) {
            const dirPath = path.join(inputPath, dirent.name);
            if (!dirent.isDirectory()) {
                const extension = dirent.name.split('.').slice(-1)[0];

                if (extension === 'json') {
                    const contents = await readFile(dirPath, {
                        encoding: 'utf-8',
                    });
                    const json: GooglePhotosMetadata = JSON.parse(contents);

                    if (json.title) {
                        if (Object.keys(json).length === 1 || json.date) {
                            continue;
                        }

                        const slicedTitle = json.title.replace(
                            /^([a-zA-ZÀ-Ÿ._ \d-()]+)(\.[a-zA-ZÀ-Ÿ.]+)/,
                            (match, p1, p2) => {
                                return p1.slice(0, 51 - p2.length) + p2;
                            }
                        );

                        if (slicedTitle !== json.title) {
                            console.log({ slicedTitle });
                        }

                        dict[slicedTitle] = {
                            ...(json.photoTakenTime?.formatted && {
                                timeCreated: json.photoTakenTime.formatted,
                            }),
                            ...(json.creationTime?.formatted && {
                                timeModified: json.creationTime.formatted,
                            }),
                            archived: json.archived,
                            locked: json.inLockedFolder,
                            trashed: json.trashed,
                            ...(json.description && {
                                description: json.description,
                            }),
                            url: json.url,
                            access: json.access, // What is that ?!
                            enrichments: json.enrichments,
                        };

                        if (json.geoData) {
                            const { latitude, longitude, altitude, latitudeSpan, longitudeSpan } = json.geoData;
                            if (latitude || longitude || altitude || latitudeSpan || longitudeSpan) {
                                dict[slicedTitle].geoData = {
                                    ...(latitude && { latitude }),
                                    ...(longitude && { longitude }),
                                    ...(altitude && { altitude }),
                                    ...(latitudeSpan && { latitudeSpan }),
                                    ...(longitudeSpan && { longitudeSpan }),
                                };
                            }
                        }

                        if (json.geoDataExif) {
                            const { latitude, longitude, altitude, latitudeSpan, longitudeSpan } = json.geoDataExif;
                            const a = latitude && latitude !== json.geoData?.latitude;
                            const b = longitude && longitude !== json.geoData?.longitude;
                            const c = altitude && altitude !== json.geoData?.altitude;
                            const d = latitudeSpan && latitudeSpan !== json.geoData?.latitudeSpan;
                            const e = longitudeSpan && longitudeSpan !== json.geoData?.longitudeSpan;
                            if (a || b || c || d || e) {
                                dict[slicedTitle].geoDataExif = {
                                    ...(a && { latitude }),
                                    ...(b && { longitude }),
                                    ...(c && { altitude }),
                                    ...(d && { latitudeSpan }),
                                    ...(e && { longitudeSpan }),
                                };
                            }
                        }

                        const { timeCreated, timeModified } = dict[slicedTitle];
                        let btime;
                        let mtime;

                        if (timeCreated) {
                            btime = timeCreated.replace(/^(\d+ )([a-zA-ZÀ-Ÿ.]+)/, (match, p1, p2) => {
                                return p1 + MonthsMap[p2 as keyof typeof MonthsMap];
                            });

                            if (Number.isNaN(new Date(String(btime)).getDate())) {
                                console.log('NaN on Time Created:', timeCreated, btime);
                            }

                            btime = new Date(btime).getTime();
                            dict[slicedTitle].btime = btime;
                        }

                        if (timeModified) {
                            mtime = timeModified.replace(/^(\d+ )([a-zA-ZÀ-Ÿ.]+)/, (match, p1, p2) => {
                                return p1 + MonthsMap[p2 as keyof typeof MonthsMap];
                            });

                            if (Number.isNaN(new Date(String(mtime)).getDate())) {
                                console.log('NaN on Time Modified:', timeModified, mtime);
                            }

                            mtime = new Date(mtime).getTime();
                            dict[slicedTitle].mtime = mtime;
                        }
                    }
                }
            } else {
                dirPaths.push(dirPath);
            }
        }

        for (const dirPath of dirPaths) {
            await traverse(dirPath);
        }
    } catch (err) {
        console.log(err);
    }
};

const generateHugeMetadataJson = async (inputPath: string) => {
    if (!inputPath.match(/takeout-\d{8}T\d{6}Z-\d{3}/)) {
        throw new Error('Source path is not in the correct format: takeout-d{8}Td{6}Z-d{3}');
    }

    await traverseTakeoutPaths(inputPath, traverse);

    try {
        await writeFile('outputPerFile.json', JSON.stringify(dict, null, 4));
    } catch (error) {
        console.error(error);
    }
};

export default generateHugeMetadataJson;
