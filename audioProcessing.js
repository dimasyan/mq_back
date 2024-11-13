import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { MusicBrainzApi } from 'musicbrainz-api';
import {v4 as uuidv4} from 'uuid';
import {Question} from './models/index.js'; // Sequelize model

ffmpeg.setFfmpegPath(ffmpegPath);
const mbApi = new MusicBrainzApi({
  appName: 'my-app',
  appVersion: '0.1.0',
  appContactInfo: 'user@mail.org',
});

// Path to your songs folder and output folder
const songsFolderPath = path.join(process.cwd(), 'songs');
const outputFolderPath = path.join(process.cwd(), 'output');

// Create a folder with the current datetime
const currentDatetime = new Date().toISOString().replace(/[:.]/g, '-');
const currentOutputFolder = path.join(outputFolderPath, currentDatetime);
if (!fs.existsSync(currentOutputFolder)) {
  fs.mkdirSync(currentOutputFolder, { recursive: true });
}

// Function to extract metadata from an audio file
async function extractMetadata(filePath) {
  try {
    const metadata = await mm.parseFile(filePath);
    const { artist, title } = metadata.common;
    const duration = metadata.format.duration; // Duration in seconds
    return { artist, title, duration };
  } catch (err) {
    console.error(`Error reading metadata from ${filePath}: ${err.message}`);
    return null;
  }
}

// Function to create audio cuts using ffmpeg
function createAudioCut(inputFile, startTime, duration, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .setStartTime(startTime)
      .setDuration(duration)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputFile);
  });
}

// Function to process each song
async function processSong(filePath) {
  const metadata = await extractMetadata(filePath);
  if (!metadata) return;

  const { artist, title, duration } = metadata;
  const songName = title || path.basename(filePath, path.extname(filePath));

  // Generate random start times
  const randomStart1 = Math.floor(Math.random() * 30); // Random between 0 and 30 seconds
  const lastMinuteStart = Math.max(duration - 60, 0); // Start of the last minute
  const randomStart2 = lastMinuteStart + Math.floor(Math.random() * 30); // Random in the last 30 sec

  // Generate unique filenames for the cuts
  const cut1File = path.join(currentOutputFolder, `${songName}_cut1_${uuidv4()}.mp3`);
  const cut2File = path.join(currentOutputFolder, `${songName}_cut2_${uuidv4()}.mp3`);

  try {
    console.log(`Processing ${songName}...`);
    await createAudioCut(filePath, randomStart1, 15, cut1File); // First cut
    await createAudioCut(filePath, randomStart2, 15, cut2File); // Second cut
    console.log(`Created cuts for ${songName}: ${cut1File}, ${cut2File}`);

    // Store relative paths starting from /output
    const relativeCut1Path = path.relative(process.cwd(), cut1File);
    const relativeCut2Path = path.relative(process.cwd(), cut2File);

    // Save metadata and cuts to the database
    await saveToDatabase(songName, artist, relativeCut1Path);
    await saveToDatabase(songName, artist, relativeCut2Path);
  } catch (err) {
    console.error(`Error creating cuts for ${filePath}: ${err.message}`);
  }
}

// Function to save question data to the database
async function saveToDatabase(text, correctAnswer, filePath) {
  try {
    await Question.create({
      text,
      correct_answer: correctAnswer,
      file_path: filePath.replace(/^.*\/output/, '/output'), // Store relative path starting with /output
    });
    console.log(`Saved question to the database: ${text}`);
  } catch (err) {
    console.error(`Error saving question to the database: ${err.message}`);
  }
}

// Function to process all files in the songs folder
function processSongsFolder() {
  fs.readdir(songsFolderPath, (err, files) => {
    if (err) {
      console.error(`Error reading the songs folder: ${err.message}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(songsFolderPath, file);
      processSong(filePath); // Process each song
    });
  });
}

async function fetchSimilarArtists(artistName) {
  try {
    const artistResults = await mbApi.search('artist', { query: artistName, limit: 1 });

    if (artistResults.artists && artistResults.artists.length > 0) {
      const artistId = artistResults.artists[0].id;
      const artistData = await mbApi.getArtistById(artistId)
      console.log(artistData)

      const relatedArtists = artistData.relations
        .filter((relation) => relation.type === 'collaboration' || relation.type === 'member of band')
        .map((relation) => relation.artist.name);

      if (relatedArtists.length > 0) {
        return relatedArtists.slice(0, 5); // Return up to 5 related artists
      }

      // Step 4: If no direct relationships, use fallback options (like tags or other recordings)
      const artistTags = artistData.tags ? artistData.tags.map((tag) => tag.name) : [];
      const recordings = await mbApi.getArtistRecordings(artistId, { limit: 5 });

      // Use tags to infer related artists or fallback to dummy data
      const fallbackArtists = recordings.recordings.map((recording) => recording.title);
      console.log(fallbackArtists)
      return fallbackArtists.length > 0 ? fallbackArtists : ['Artist #1', 'Artist #2', 'Artist #3']; // Fallback dummy data
    } else {
      return ['Artist #1', 'Artist #2', 'Artist #3']; // Fallback dummy data
    }
  } catch (error) {
    console.error('Error fetching similar artists:', error.message);
    return ['Artist #1', 'Artist #2', 'Artist #3']; // Return dummy data in case of error
  }
}

// Run the function to process the folder
processSongsFolder();
