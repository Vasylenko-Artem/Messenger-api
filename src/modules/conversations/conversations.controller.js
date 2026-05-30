import * as conversationsService from './conversations.service.js';
import { requireAuthUserId } from '../../shared/validation/validators.js';

export const create = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
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
    const userId = requireAuthUserId(req);

    const conversations = await conversationsService.getConversations(userId);

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

export const addParticipants = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
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
    const userId = requireAuthUserId(req);
    const { id } = req.params;

    await conversationsService.deleteConversation(id, userId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
