import puppeteer from 'puppeteer'; // Make sure you import puppeteer
import axios from 'axios';
import qs from 'qs';
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();
const clientId = process.env.SP_CLIENT_ID;
const clientSecret = process.env.SP_CLIENT_SECRET;
const token = 'BQBs48klbHPUX7QfJB9c7Om-V5-5Ez5q2YwsRsbVCxHEckgG9mOd9tV8BF8pXLDgXwVfIkkFwWRorTzAyXlekH3BBBEaOgLzXbN7XKAZnJbwcpkhn6-2EoAGOcef-RJi1TGEuLLzAog';

// Create a browser instance once
let browser;
const initBrowser = async () => {
  browser = await puppeteer.launch({ headless: false, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
};

// Function to search YouTube and get the first video link for a query
const getFirstYouTubeLink = async (query, page) => {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  console.log(`Navigating to: ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  // Wait for video results to load
  await page.waitForSelector('ytd-video-renderer');
  console.log('Page loaded, searching for video...');

  // Get the first non-ad video link
  const firstLink = await page.evaluate(() => {
    const videoElements = document.querySelectorAll('ytd-video-renderer');
    if (!videoElements || videoElements.length === 0) {
      console.log('No video elements found');
      return null;
    }

    // Loop through video elements
    for (let video of videoElements) {
        const link = video.querySelector('a#video-title');
        if (link) {
          console.log(`Found video: ${link.textContent.trim()}`);
          return {
            title: link.textContent.trim(),
            url: `https://www.youtube.com${link.getAttribute('href')}`
          };
        }
    }
    return null; // No valid link found
  });

  return firstLink;
};

// Spotify-related code
const getAccessToken = async () => {
  try {
    const data = qs.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    const response = await axios.post('https://accounts.spotify.com/api/token', data);
    console.log('Access Token:', response.data);
  } catch (e) {
    console.error('Error getting access token:', e);
  }
};

const getPlaylists = async () => {
  try {
    const playlistId = '1JNYqFwOv1bIrXUjHTIDAC'
    const offset = 150;
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Initialize browser instance and page
    const page = await browser.newPage();
    const data = [];

    for (let item of response.data.items) {
      try {
        // Check if `item.track` and necessary properties exist
        if (item.track && item.track.name && item.track.artists && item.track.artists[0]) {
          console.log(`Processing track: ${item.track.name}`);
           const ytUrl = await getFirstYouTubeLink(item.track.artists[0].name + ' - ' + item.track.name + ' lyrics', page);

          if (ytUrl) {
            data.push({
              ...item.track,
              ytUrl: ytUrl.url
            });
          } else {
            console.log(`No YouTube URL found for track: ${item.track.name}`);
          }
        } else {
          console.log('Skipping a track due to missing data');
        }
      } catch (err) {
        console.error(`Error processing track "${item.track ? item.track.name : 'unknown'}": ${err.message}`);
        // Continue to the next track
      }
    }

    const filePath = `${playlistId}.json`;

// Check if file exists
    if (fs.existsSync(filePath)) {
      try {
        // Read existing data from file
        const existingRaw = fs.readFileSync(filePath, 'utf-8');
        const existingData = JSON.parse(existingRaw);

        // Merge arrays - you can decide whether to just concat or do some deduplication
        const mergedData = existingData.concat(data);

        // Save merged array back to file
        fs.writeFileSync(filePath, JSON.stringify(mergedData, null, 2));
        console.log(`Updated existing file ${filePath} with new data, total items: ${mergedData.length}`);
      } catch (e) {
        console.error('Error reading or writing JSON file:', e);
      }
    } else {
      // File doesn't exist, create new file with data array
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Created new file ${filePath} with data`);
    }

    await page.close(); // Close the page after processing all queries
  } catch (e) {
    console.error('Error in getPlaylists:', e);
  }
};

const calcObjects = () => {
  const data = fs.readFileSync('1JNYqFwOv1bIrXUjHTIDAC.json', 'utf-8');
  const arr = JSON.parse(data);

  console.log('Number of objects:', arr.length);
}


// Initialize the browser instance once before starting any scraping tasks
initBrowser().then(() => {
  // Now you can get playlists after the browser has been initialized
  getPlaylists();
  // getAccessToken(); // Uncomment if you need to get an access token
});
 // getAccessToken();
// calcObjects()
