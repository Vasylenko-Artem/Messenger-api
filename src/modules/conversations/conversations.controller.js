import * as conversationsService from './conversations.service.js';

export const create = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const { type, participantIds } = req.body;

    const conversation = await conversationsService.createConversation(
      userId,
      type,
      participantIds
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await conversationsService.getConversations(userId);

    res.json(conversations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await conversationsService.deleteConversation(id, userId);

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
