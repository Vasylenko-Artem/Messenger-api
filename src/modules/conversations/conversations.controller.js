import * as conversationsService from './conversations.service.js';
import {
  assertObjectBody,
  enumValue,
  requireAuthUserId,
  requiredString,
  requiredStringArray,
} from '../../shared/validation/validators.js';

const conversationTypes = ['PRIVATE', 'GROUP'];

export const create = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    assertObjectBody(req.body);

    const body = {
      type: enumValue(req.body.type, 'type', conversationTypes),
      participantIds: requiredStringArray(
        req.body.participantIds,
        'participantIds'
      ),
    };

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
    assertObjectBody(req.body);

    const id = requiredString(req.params.id, 'id');
    const participantIds = requiredStringArray(
      req.body.participantIds,
      'participantIds'
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
    const id = requiredString(req.params.id, 'id');

    await conversationsService.deleteConversation(id, userId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
