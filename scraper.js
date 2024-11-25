import puppeteer from 'puppeteer';

export const getFirstYouTubeLink = async (query) => {
  const browser = await puppeteer.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage();

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // Wait for video results to load
  await page.waitForSelector('ytd-video-renderer');

  // Get the first non-ad video link
  const firstLink = await page.evaluate(() => {
    const videoElements = document.querySelectorAll('ytd-video-renderer');

    for (let video of videoElements) {
      const adBadge = video.querySelector('ytd-badge-supported-renderer');
      if (!adBadge) { // Skip if it's an ad
        const link = video.querySelector('a#video-title');
        if (link) {
          return {
            title: link.textContent.trim(),
            url: `https://www.youtube.com${link.getAttribute('href')}`
          };
        }
      }
    }
    return null; // No valid link found
  });

  await browser.close();
  return firstLink;
};

// Example usage in another script
// import { getFirstYouTubeLink } from './your-script-file.js';
// const link = await getFirstYouTubeLink('your search query');
// console.log(link);
