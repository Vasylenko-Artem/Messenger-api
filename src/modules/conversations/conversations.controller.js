import * as conversationsService from './conversations.service.js';
import {
  conversationsValidation,
  requireAuthUserId,
  validateBody,
  validateParams,
} from '../../shared/validation/validators.js';

export const create = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const body = validateBody(conversationsValidation.create, req);

    const conversation = await conversationsService.createConversation(
      userId,
      body.type,
      body.participantIds
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
    const { id } = validateParams(conversationsValidation.idParams, req);
    const { participantIds } = validateBody(
      conversationsValidation.addParticipants,
      req
    );

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
    const { id } = validateParams(conversationsValidation.idParams, req);

    await conversationsService.deleteConversation(id, userId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
