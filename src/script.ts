import applyMetadata from './applyMetadata.js';
import generateHugeMetadataJson from './generateHugeMetadataJson.js';
import traverseTakeoutPaths from './helpers/traverseTakeoutPaths.js';
import moveFiles from './moveFiles.js';

const [googleTakeoutPath, targetPath] = process.argv.slice(2);

console.log('Path:', googleTakeoutPath);
console.log('---');

// Step 1: Create the huge metadata JSON file
process.stdout.write('Generating the metadata JSON...');
await generateHugeMetadataJson(googleTakeoutPath);
console.log('OK');

await traverseTakeoutPaths(googleTakeoutPath, async (googlePhotosPath: string) => {
    // Step 2: Apply the metadata to the media files
    process.stdout.write('Applying metadata...');
    await applyMetadata(googlePhotosPath);
    console.log('OK');

    // Step 3: Move the files to a new directory organized by year
    process.stdout.write('Moving the files...');
    await moveFiles(googlePhotosPath, targetPath);
    console.log('OK');
});
