import * as conversationsService from './conversations.service.js';

const getErrorStatus = (message) => {
  if (message === 'Forbidden') {
    return 403;
  }

  if (message === 'Conversation not found') {
    return 404;
  }

  return 400;
};

const getUserId = (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  return req.user.id;
};

export const create = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const { type, participantIds } = req.body;

    const conversation = await conversationsService.createConversation(
      userId,
      type,
      participantIds
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const conversations = await conversationsService.getConversations(userId);

    res.json(conversations);
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const { id } = req.params;

    await conversationsService.deleteConversation(id, userId);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};
