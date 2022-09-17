const generatePrompt = require("./promptGenerator");
const fs = require("fs");
const openAI = require("./openAI");

async function analyseAndReply(
  page,
  orderedMessages,
  OUR_TINDER_USER_ID,
  theirName,
  conversationId
) {
  // Last message is the first in the messages array
  const isLastMessageByThem =
    orderedMessages[orderedMessages.length - 1] &&
    orderedMessages[orderedMessages.length - 1].from !== OUR_TINDER_USER_ID;

  console.log(
    "Last message by",
    isLastMessageByThem ? "them 😏" : "us ...going to next conversation"
  );

  if (isLastMessageByThem) {
    const generatedPrompt = generatePrompt(
      orderedMessages,
      OUR_TINDER_USER_ID,
      "Anthony",
      theirName
    );

    const completion = await openAI.getNextUserMessage(
      generatedPrompt,
      theirName
    );

    const text = completion.data.choices[0].text
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace("Anthony:", "");

    console.log("🤖 says:", text);

    // Save the conversation in a JSON file
    fs.writeFile(
      `conversations/${theirName}-${conversationId}.txt`,
      generatedPrompt,
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );

    // Focus and type the message like a user would (slowly)
    await page.focus("textarea");
    await page.keyboard.type(text);

    // Send the message
    await page.keyboard.press("Enter");
  }
}

module.exports = analyseAndReply;
