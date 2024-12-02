import fs from 'fs';
import ytdl from '@distube/ytdl-core';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegPath from 'ffmpeg-static';
import sanitize from 'sanitize-filename'; // To sanitize file names
import { exec } from 'child_process'; // Import exec for executing ffmpeg commands

// Read the array of YouTube links from a JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const links = JSON.parse(fs.readFileSync('popmix.json', 'utf-8'));

// Create the /downloads folder if it doesn't exist
const downloadsDir = path.resolve(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Function to download and inject metadata into audio
const downloadAndInjectMetadata = async (url, index, fileName, metadata) => {
  try {
    console.log(`Starting download for: ${url}`);

    // Sanitize filename to prevent invalid characters
    const sanitizedFileName = sanitize(fileName).replace(/[/\\?%*:|"<>]/g, '-'); // Replace problematic characters with '-'

    // Paths for the downloaded files
    const webmOutputPath = path.join(downloadsDir, `${sanitizedFileName}.webm`);
    const webmWithMetadataPath = path.join(downloadsDir, `${sanitizedFileName}_metadata.webm`);

    // Create a write stream and download the audio
    const writeStream = fs.createWriteStream(webmOutputPath);
    const audioStream = ytdl.downloadFromInfo(await ytdl.getInfo(url), { filter: 'audioonly', quality: 'highestaudio' });

    // Handle download completion
    audioStream.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log(`Downloaded .webm file: ${webmOutputPath}`);

      // Inject metadata using ffmpeg
      const metadataCommand = `${ffmpegPath} -i "${webmOutputPath}" -metadata title="${metadata.title}" -metadata artist="${metadata.artist}" -c:v libvpx -c:a libvorbis -y "${webmWithMetadataPath}"`;

      exec(metadataCommand, (metadataError, metaStdout, metaStderr) => {
        if (metadataError) {
          console.error(`Error injecting metadata for ${url}:`, metadataError);
          return;
        }

        // Check if the metadata file exists before renaming
        fs.access(webmWithMetadataPath, fs.constants.F_OK, (err) => {
          if (err) {
            console.error(`Metadata file does not exist: ${webmWithMetadataPath}`);
            return;
          }

          console.log(`Metadata injection complete: ${webmWithMetadataPath}`);

          // Replace the original .webm file with the one containing metadata
          try {
            fs.renameSync(webmWithMetadataPath, webmOutputPath);
          } catch (renameError) {
            console.error(`Error renaming file:`, renameError);
          }
        });
      });
    });

    // Handle errors in the audio stream
    audioStream.on('error', (streamError) => {
      console.error(`Download error for ${url}:`, streamError);
      writeStream.close();
      fs.unlink(webmOutputPath, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to delete partial download:', unlinkErr);
      });
    });

    // Handle errors in the write stream
    writeStream.on('error', (writeError) => {
      console.error(`Write stream error for ${url}:`, writeError);
      writeStream.close();
      fs.unlink(webmOutputPath, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to delete partial download:', unlinkErr);
      });
    });
  } catch (error) {
    console.error(`Failed to process ${url}:`, error);
  }
};
// Download each link
links.forEach((trackItem, index) => {
  if (trackItem.ytUrl) {
    const metaData = {
      artist: trackItem.artists[0].name,
      title: trackItem.name
    };
    const fileName = `${trackItem.artists[0].name} - ${trackItem.name}`;
    downloadAndInjectMetadata(trackItem.ytUrl, index, fileName, metaData);
  }
});
