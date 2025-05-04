import { mkdir, readdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import { Dirent } from 'node:fs';
import { Dict, UsefulJsonKeys } from './types.js';
import getMetadataJson from './helpers/getMetadataJson.js';
import getMetadataObject from './helpers/getMetadataObject.js';

const ignoredExtensions: string[] = ['json', 'htm', 'html'];

const traverse = async (inputPath: string, targetPath: string, metadataJson: Dict) => {
    try {
        const files: Dirent[] = await readdir(inputPath, {
            withFileTypes: true,
        });

        const dirPaths: string[] = [];

        for (const dirent of files) {
            const dirPath = path.join(inputPath, dirent.name);
            if (!dirent.isDirectory()) {
                const extension = dirent.name.split('.').slice(-1)[0];
                if (ignoredExtensions.includes(extension)) {
                    continue;
                }

                // Read the btime and move the file accordingly
                const stats = await stat(dirPath);
                const fullYear = stats.birthtime.getFullYear();

                if (typeof fullYear === 'number') {
                    const sourcePath = dirPath;
                    let destinationDirectory = path.join(targetPath, String(fullYear));

                    // Check if the media file is in the archived or locked directory
                    const obj: UsefulJsonKeys = getMetadataObject(dirent.name, metadataJson);

                    if (obj) {
                        if (obj.locked) {
                            destinationDirectory = path.join(destinationDirectory, 'locked');
                        } else if (obj.archived) {
                            destinationDirectory = path.join(destinationDirectory, 'archived');
                        }
                    }

                    const destinationPath = path.join(destinationDirectory, dirent.name);

                    try {
                        await rename(sourcePath, destinationPath);
                    } catch (err) {
                        if (err && typeof err === 'object' && 'code' in err) {
                            const error = err as NodeJS.ErrnoException;
                            if (error.code === 'ENOENT') {
                                await mkdir(destinationDirectory, { recursive: true });

                                try {
                                    await rename(sourcePath, destinationPath);
                                } catch (err) {
                                    console.error('Moving error:', err);
                                }
                            }
                        }
                    }
                }
            } else {
                dirPaths.push(dirPath);
            }
        }

        for (const dirPath of dirPaths) {
            await traverse(dirPath, targetPath, metadataJson);
        }
    } catch (err) {
        console.log(err);
    }
};

const moveFiles = async (googlePhotosPath: string, targetPath: string) => {
    const metadataJson = await getMetadataJson();

    await traverse(googlePhotosPath, targetPath, metadataJson);
};

export default moveFiles;
