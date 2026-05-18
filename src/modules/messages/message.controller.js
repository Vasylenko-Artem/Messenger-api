import * as messageService from './message.service.js';

// ─── Send message ────────────────────────────────────────────────────────────

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const message = await messageService.sendMessage(senderId, req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ─── Get messages ─────────────────────────────────────────────────────────────

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const messages = await messageService.getMessages(userId, conversationId);
    res.status(200).json(messages);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ─── Edit message ─────────────────────────────────────────────────────────────

export const editMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updated = await messageService.editMessage(userId, id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ─── Mark as read ─────────────────────────────────────────────────────────────

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await messageService.markAsRead(userId, id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};