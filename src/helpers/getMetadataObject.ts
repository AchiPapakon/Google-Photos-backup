import { Dict, UsefulJsonKeys } from '../types.js';
import getExtension from './getExtension.js';

const getMetadataObject = (fileName: string, metadataJson: Dict) => {
    let nameEvolution = fileName.replace('-modifié', '').replace('-modified', '');
    let obj: UsefulJsonKeys = metadataJson[nameEvolution as keyof typeof metadataJson];

    if (!obj) {
        // Get rid of the parenthesized number
        nameEvolution = nameEvolution.replace(/( ?\(\d+\))(\.\w+)/, '$2');
        obj = metadataJson[nameEvolution];

        if (!obj) {
            // This step is for live photos
            if (getExtension(fileName).match(/^mp4$/i)) {
                nameEvolution = nameEvolution.replace(/mp4$/i, 'HEIC');
                obj = metadataJson[nameEvolution];

                if (!obj) {
                    nameEvolution = nameEvolution.replace(/heic$/i, 'heic');
                    obj = metadataJson[nameEvolution];
                }
            }

            // This step is for big names (probably from facebook)
            if (!obj) {
                const probableKey = Object.keys(metadataJson).find((key) => key.startsWith(fileName));
                if (probableKey) {
                    obj = metadataJson[probableKey];
                }
            }
        }
    }

    return obj;
};

export default getMetadataObject;
