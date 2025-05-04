import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Dirent } from 'node:fs';
import { utimes } from 'utimes';
import { Dict } from './types.js';
import getExtension from './helpers/getExtension.js';
import getMetadataObject from './helpers/getMetadataObject.js';
import getMetadataJson from './helpers/getMetadataJson.js';

const ignoredExtensions: string[] = ['json'];

const traverse = async (inputPath: string, metadataJson: Dict) => {
    try {
        const files: Dirent[] = await readdir(inputPath, { withFileTypes: true });

        const dirPaths: string[] = [];

        for (const dirent of files) {
            const dirPath = path.join(inputPath, dirent.name);
            if (!dirent.isDirectory()) {
                const extension = getExtension(dirent.name);
                if (ignoredExtensions.includes(extension)) {
                    continue;
                }

                const obj = getMetadataObject(dirent.name, metadataJson);
                if (!obj) {
                    console.error('Error: metadata not found for file', dirPath); // Never delete this console log
                    continue;
                }

                await utimes(dirPath, {
                    btime: obj.btime,
                    mtime: obj.mtime,
                    atime: undefined,
                });
            } else {
                dirPaths.push(dirPath);
            }
        }

        for (const dirPath of dirPaths) {
            await traverse(dirPath, metadataJson);
        }
    } catch (err) {
        console.log(err);
    }
};

const applyMetadata = async (inputPath: string) => {
    const metadataJson = await getMetadataJson();

    await traverse(inputPath, metadataJson);
};

export default applyMetadata;
