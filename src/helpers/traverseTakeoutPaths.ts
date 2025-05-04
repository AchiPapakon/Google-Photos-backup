import path from 'node:path';
import { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';

const traverseTakeoutPaths = async (inputPath: string, callback: Function) => {
    try {
        const parentDirectory = path.dirname(inputPath);

        const filesInParentDirectory: Dirent[] = await readdir(parentDirectory, { withFileTypes: true });

        for (const dirent of filesInParentDirectory) {
            if (dirent.isDirectory()) {
                if (dirent.name.match(/takeout-\d{8}T\d{6}Z-\d{3}/)) {
                    const dirPath = path.join(dirent.parentPath, dirent.name, 'Takeout', 'Google Photos');
                    await callback(dirPath);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
};

export default traverseTakeoutPaths;
