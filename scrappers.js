const utils = require("./utils");

const blackListedIDS = [
  "62c0a0266dc4b2010018f8df62e8dc4fdd568901001aa014",
  "62e8dc4fdd568901001aa01462f7c675dd5689010020be44",
  "5ef054d702a182010059961262e8dc4fdd568901001aa014"
];

async function scrapDiscussions(page) {
  // Find all the conversations
  const conversations = await page.$$(
    "div.messageList > div > div > a",
    (elements) => elements
  );

  // Get all messages elements in the UI
  const elementsHrefs = await Promise.all(
    conversations.map((el) => el.getProperty("href"))
  );

  // This is the URLS of every conversations that needs to be checked
  const hrefs = await Promise.all(elementsHrefs.map((el) => el.jsonValue()));

  return hrefs.filter(
    (href) => blackListedIDS.find((id) => href.includes(id)) === undefined
  );
}

async function scrapConversation(page, href, OUR_TINDER_USER_ID) {
  // Get the conversation ID
  const urlParams = href.split("/");
  const conversationId = urlParams[urlParams.length - 1];

  // Spy the request to get the one containing the messages
  const httpResponseWeWaitForPromise = page.waitForResponse((response) => {
    const urlToSpy = `https://api.gotinder.com/v2/matches/${conversationId}/messages`;
    return response.url().startsWith(urlToSpy) && response.status() === 200;
  });

  // Open the conversation
  await Promise.all([
    page.waitForNavigation(),
    page.goto(href, { waitUntil: "networkidle2" }),
    // Wait for the name to be display
    page.waitForSelector("nav > a > span")
  ]);

  // Get the match's name in the UI
  const theirName = await page.$eval("nav > a > span", (el) => el.innerText);

  console.log("Scrapping message for ", theirName);

  // Wait for the HTTP call response containing the messages
  const httpResponseWeWait = await httpResponseWeWaitForPromise;
  const conversationResponse = await httpResponseWeWait.json();

  // Messages ordered from the most recent, to the latest
  const messages = conversationResponse.data.messages;

  /**
        * STRUCTURE OF A MESSAGE
        "_id": "62f931baecf99a010083392f",
        "match_id": "61560a0ac6d55901005ef67562e8dc4fdd568901001aa014",
        "sent_date": "2022-08-14T17:32:42.899Z",
        "message": "I have them for like 2 months 🙄",
        "to": "61560a0ac6d55901005ef675",
        "from": "62e8dc4fdd568901001aa014",
        "created_date": "2022-08-14T17:32:42.899Z",
        "timestamp": 1660498362899
       */

  // Unfortunately Tinder sends the last message through websockets,
  // so we need to grab the last message within the UI itself

  // Also, there is a display bug when sometimes, the last message is display as the first one...
  // So we need to run some checks to be certain to have the proper conversation history

  // We get all the message elements
  const messagesUI = await page.$$("div.msg", async (el) =>
    el.map(async (x) => await x.getAttribute("innerText").toJson())
  );

  // We grab the ref of the first and last one
  const lastMessageInUIEl = messagesUI[messagesUI.length - 1];
  const firstMessageInUIEl = messagesUI[0];

  // We grab their content and sender
  const [firstMessage, lastMessage] = await Promise.all([
    utils.getTextAndRecipient(firstMessageInUIEl, OUR_TINDER_USER_ID, ""),
    utils.getTextAndRecipient(lastMessageInUIEl, OUR_TINDER_USER_ID, "")
  ]);

  // Run check and reconstruct the message history, one of the first or last message will already be in the list message list
  // Meaning we need to add the other
  const messagesHistory = utils.reconstructMessageHistory(
    messages,
    firstMessage,
    lastMessage
  );

  const orderedMessages = messagesHistory.sort(function (x, y) {
    return x.timestamp - y.timestamp;
  });

  return { messages: orderedMessages, theirName, conversationId };
}

module.exports = {
  scrapConversation,
  scrapDiscussions
};
