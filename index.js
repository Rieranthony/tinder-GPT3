// loads env file
require("dotenv").config();

const puppeteer = require("puppeteer-extra");

const scrappers = require("./scrappers");
const analyseAndReply = require("./analyseAndReply");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

// Replace by your user ID, you can find it in the network tab in the requests
const OUR_TINDER_USER_ID = process.env.OUR_TINDER_USER_ID;

async function scrap(browser) {
  const [page] = await browser.pages();

  const TINDER_MATCHES_URL = "https://tinder.com/app/matches";
  console.log("Beginning scraping 👀");

  await page.goto(TINDER_MATCHES_URL, {
    waitUntil: "networkidle2"
  });

  // Get all opened conversations
  const conversationUrls = await scrappers.scrapDiscussions(page);

  console.log("Conversation found: ", conversationUrls.length);

  // Loops through them and reply using GPT3
  for (const url of conversationUrls) {
    try {
      // Get all messages in the conversation
      const { messages, theirName, conversationId } =
        await scrappers.scrapConversation(page, url, OUR_TINDER_USER_ID);

      // Analyse the conversation and reply using GPT3 if needed
      await analyseAndReply(
        page,
        messages,
        OUR_TINDER_USER_ID,
        theirName,
        conversationId
      );
    } catch (err) {
      console.log("ERR WHILE REPLYING:", err);
    }
  }
}

// Auto start main logic
(async () => {
  const wsChromeEndpointurl = process.env.CHROME_WS_ENDPOINT;

  // Check if the env var are filled up
  if (
    !process.env.OUR_TINDER_USER_ID ||
    !wsChromeEndpointurl ||
    !process.env.OPENAI_API_KEY
  ) {
    throw new Error(
      "ENV variables missing. Please duplicate .env.example and fill it then start again."
    );
  }

  /**
   * Start remote debugger by running the command below
   * /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')
   */

  // Paste the websocket endpoint bellow
  // Connect to the chrome with the websocket endpoint
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointurl,
    slowMo: 100
  });

  console.log("🔥 Starting tinder bot..");

  // Start first iteration now
  scrap(browser);

  // Then execute the logic every 30 minutes
  setInterval(async function () {
    await scrap(browser);

    // 30 minutes
  }, 1000 * 60 * 30);
})();
