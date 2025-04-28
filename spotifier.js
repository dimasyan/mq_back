import puppeteer from 'puppeteer'; // Make sure you import puppeteer
import axios from 'axios';
import qs from 'qs';
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();
const clientId = process.env.SP_CLIENT_ID;
const clientSecret = process.env.SP_CLIENT_SECRET;
const token = 'BQCzIhk-hEdX3lUM13qNiiCRHoxYVRIe67SLKqNz5MYUqj198sR3X4VzgCW_MUQmNroC-hzA-t3HpPMo7M9jHnTm6Cn0gfCpxeIQtdBC2gIUBe_GNdw';

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
    const response = await axios.get('https://api.spotify.com/v1/playlists/1JNYqFwOv1bIrXUjHTIDAC', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Initialize browser instance and page
    const page = await browser.newPage();
    const data = [];

    for (let item of response.data.tracks.items) {
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

    console.log(data);

    // Save the playlist with YouTube URLs
    fs.writeFileSync(`${response.data.name}.json`, JSON.stringify(data, null, 2));
    console.log('Playlist saved successfully');

    await page.close(); // Close the page after processing all queries
  } catch (e) {
    console.error('Error in getPlaylists:', e);
  }
};


// Initialize the browser instance once before starting any scraping tasks
initBrowser().then(() => {
  // Now you can get playlists after the browser has been initialized
  getPlaylists();
  // getAccessToken(); // Uncomment if you need to get an access token
});
//getAccessToken();
