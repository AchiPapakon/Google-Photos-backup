# Overview
It takes as input the first folder from Google Takeout and automatically finds the other sibling folders. It moves any media files found to the target destination, organized by year. It automatically applies metadata from Google's json files.

# How to run
```sh
# Navigate to the root of the project
npx tsc && node dest/script.js takeoutFolderPath-001 targetPath
```

### Steps
- Step 1: Create the huge metadata JSON file
- Step 2: Apply the metadata to the media files
- Step 3: Move the files to a new directory organized by year