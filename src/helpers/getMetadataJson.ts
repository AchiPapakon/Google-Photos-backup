import { readFile } from 'node:fs/promises';

const getMetadataJson = async () => {
    const metadataFile = await readFile('outputPerFile.json', { encoding: 'utf-8' });
    const metadataJson = JSON.parse(metadataFile);

    return metadataJson;
};

export default getMetadataJson;
