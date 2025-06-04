import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process'
import pLimit from 'p-limit'

// Path to your song directory
const songsDir = path.resolve('./songs');

// Function to convert .webm to .mp3 using ffmpeg-static
const convertWebmToMp3 = (webmFilePath, mp3FilePath) => {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpeg, [
      '-i', webmFilePath,
      '-c:a', 'libmp3lame',
      '-b:a', '128k',
      '-ar', '44100',
      '-map', 'a',
      mp3FilePath,
    ]);

    let stderr = '';
    ffmpegProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpegProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`ffmpeg exited with code ${code}: ${stderr}`);
      } else {
        resolve(`Successfully converted ${webmFilePath} to ${mp3FilePath}`);
      }
    });
  });
};

const limit = pLimit(4)
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

    const tasks = webmFiles.map(webmFile => {
      return limit(async () => {
        const webmFilePath = path.join(songsDir, webmFile);
        const mp3FilePath = path.join(songsDir, webmFile.replace('.webm', '.mp3'));

        if (fs.existsSync(mp3FilePath)) {
          console.log(`Skipping ${webmFile} as the .mp3 version already exists.`);
          return;
        }

        try {
          console.log(`Converting ${webmFile}...`);
          await convertWebmToMp3(webmFilePath, mp3FilePath);
          console.log(`Successfully converted and saved: ${mp3FilePath}`);

          fs.unlinkSync(webmFilePath);
          console.log(`Deleted original .webm file: ${webmFile}`);
        } catch (error) {
          console.error(`Error converting ${webmFile}:`, error);
        }
      });
    });

    await Promise.all(tasks);

    console.log('All conversions and deletions are complete!');
  } catch (error) {
    console.error('Error processing files:', error);
  }
};

// Start the conversion process
convertAllSongs();
