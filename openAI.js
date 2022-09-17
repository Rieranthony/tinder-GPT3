// loads env file
require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const getNextUserMessage = async (prompt, theirName) => {
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt,
    temperature: 0.9,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 1.5,
    presence_penalty: 0.2,
    stop: ["Anthony says:", `${theirName}:`, `${theirName} says:`, "Anthony:"]
  });

  return response;
};

module.exports = {
  getNextUserMessage
};
