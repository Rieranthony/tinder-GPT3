const getTextAndRecipient = async (elRef, ourId, theirId) => {
  // Take the message content
  const text = await elRef.getProperty("textContent");
  const message = await text.jsonValue();

  // Take class names associated to message
  const messageClassName = await elRef.getProperty("className");
  const classNameValue = await messageClassName.jsonValue();

  // When the sender is them, the text color is BLACK and might contain those classes
  const isMessageByThem =
    classNameValue.includes("C(#000)") ||
    classNameValue.includes("C($c-ds-text-chat-bubble-receive)") ||
    classNameValue.includes("msg--received");

  // return an object that follows tinder's message data shape
  return {
    message,
    to: isMessageByThem ? ourId : theirId,
    from: isMessageByThem ? theirId : ourId,
    timestamp: Date.now()
  };
};

const reconstructMessageHistory = (messages, firstMessage, lastMessage) => {
  // If first and last are the same, it means there is only one message sent
  if (firstMessage.message === lastMessage.message) {
    return [firstMessage];
  }

  const lastMessageExists = messages.find(
    (el) => el.message === lastMessage.message
  );

  let missingMessage = !lastMessageExists ? [lastMessage] : [];

  for (const m of messages) {
    if (m.message === lastMessage.message) {
      missingMessage = [firstMessage];
    }
  }

  return [...messages, ...missingMessage];
};

module.exports = {
  reconstructMessageHistory,
  getTextAndRecipient
};
