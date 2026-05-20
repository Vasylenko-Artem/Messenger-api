import * as conversationsService from './conversations.service.js';

const getUserId = (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  return req.user.id;
};

export const create = async (req, res, next) => {
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
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const conversations = await conversationsService.getConversations(userId);

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

export const addParticipants = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const { id } = req.params;
    const { participantIds } = req.body;

    const conversation =
      await conversationsService.addParticipantsToConversation(
        id,
        userId,
        participantIds
      );

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
      return;
    }

    const { id } = req.params;

    await conversationsService.deleteConversation(id, userId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
