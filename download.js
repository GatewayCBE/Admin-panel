const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// 1. Initialize the storage client using your service account
const storage = new Storage({
  keyFilename: path.join(__dirname, 'serviceAccountKey.json') 
});

// 2. Replace with your actual Firebase Storage bucket name 
// (e.g., "your-project-id.appspot.com" or "your-project-id.firebasestorage.app")
const bucketName = 'gs://play-arena-e83d8.firebasestorage.app';
const localDownloadDir = './firebase_backup';

async function downloadCompleteBucket() {
  try {
    const bucket = storage.bucket(bucketName);

    // Get all files (blobs) in the bucket recursively
    console.log('Fetching file list from Firebase Storage...');
    const [files] = await bucket.getFiles();
    
    console.log(`Found ${files.length} files. Starting download...`);

    for (const file of files) {
      if (file.name.endsWith('/')) continue;

      const localPath = path.join(localDownloadDir, file.name);
      const localDir = path.dirname(localPath);

      // 1. SKIP IF ALREADY DOWNLOADED: Saves bandwidth and time on resumes
      if (fs.existsSync(localPath)) {
        console.log(`Skipping (already exists): ${file.name}`);
        continue;
      }

      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      // 2. RETRY LOGIC: If the network drops, it will try again instead of crashing
      let downloadSuccess = false;
      let attempts = 0;
      
      while (!downloadSuccess && attempts < 3) {
        try {
          attempts++;
          console.log(`Downloading: ${file.name} ${attempts > 1 ? `(Attempt ${attempts})` : ''}`);
          await file.download({ destination: localPath });
          downloadSuccess = true;
        } catch (downloadError) {
          console.warn(`⚠️ Temporary error downloading ${file.name}: ${downloadError.message}`);
          if (attempts >= 3) {
            console.error(`❌ Failed to download ${file.name} after 3 attempts. Skipping to next file.`);
          } else {
            // Wait 2 seconds before retrying to let the network stabilize
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }

    console.log('🎉 Complete data download finished successfully!');
  } catch (error) {
    console.error('Error downloading bucket:', error);
  }
}

downloadCompleteBucket();