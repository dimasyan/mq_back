import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg-static';

// Path to your song directory
const songsDir = path.resolve('./songs2');

// Function to convert .webm to .mp3 using ffmpeg-static
const convertWebmToMp3 = (webmFilePath, mp3FilePath) => {
  return new Promise((resolve, reject) => {
    const command = `"${ffmpeg}" -i "${webmFilePath}" -c:a libmp3lame -b:a 128k -ar 44100 -map a "${mp3FilePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error converting file (${webmFilePath}): ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`ffmpeg output for ${webmFilePath}: ${stderr}`);
      }
      resolve(`Successfully converted ${webmFilePath} to ${mp3FilePath}`);
    });
  });
};

// Function to process all .webm files in the songs directory
const convertAllSongs = async () => {
  try {
    const files = fs.readdirSync(songsDir);

    // Filter only .webm files
    const webmFiles = files.filter(file => path.extname(file).toLowerCase() === '.webm');

    if (webmFiles.length === 0) {
      console.log('No .webm files found in the directory.');
      return;
    }

    for (const webmFile of webmFiles) {
      const webmFilePath = path.join(songsDir, webmFile);
      const mp3FilePath = path.join(songsDir, webmFile.replace('.webm', '.mp3'));

      // Skip if the target .mp3 file already exists
      if (fs.existsSync(mp3FilePath)) {
        console.log(`Skipping ${webmFile} as the .mp3 version already exists.`);
        continue;
      }

      try {
        console.log(`Converting ${webmFile}...`);
        await convertWebmToMp3(webmFilePath, mp3FilePath);
        console.log(`Successfully converted and saved: ${mp3FilePath}`);

        // Delete the original .webm file after successful conversion
        fs.unlinkSync(webmFilePath);
        console.log(`Deleted original .webm file: ${webmFile}`);
      } catch (error) {
        console.error(`Error converting ${webmFile}:`, error);
      }
    }

    console.log('All conversions and deletions are complete!');
  } catch (error) {
    console.error('Error processing files:', error);
  }
};

// Start the conversion process
convertAllSongs();
