/**
 * Notification utility helper for common notification messages
 * Use with useNotification hook
 */

export const notificationMessages = {
  // Message notifications
  messageSent: {
    message: "Message sent successfully!",
    type: "success",
    duration: 2000,
  },
  messageSendError: {
    message: "Failed to send message. Please try again.",
    type: "error",
    duration: 3000,
  },
  emptyMessage: {
    message: "Please type a message before sending.",
    type: "warning",
    duration: 2000,
  },
  newMessage: {
    message: "You have a new message!",
    type: "info",
    duration: 3000,
  },

  // Conversation notifications
  conversationMarkedAsRead: {
    message: "Conversation marked as read",
    type: "success",
    duration: 2000,
  },
  markAsReadError: {
    message: "Failed to mark conversation as read",
    type: "error",
    duration: 3000,
  },

  // General notifications
  success: (msg) => ({
    message: msg,
    type: "success",
    duration: 2000,
  }),
  error: (msg) => ({
    message: msg,
    type: "error",
    duration: 3000,
  }),
  warning: (msg) => ({
    message: msg,
    type: "warning",
    duration: 2000,
  }),
  info: (msg) => ({
    message: msg,
    type: "info",
    duration: 3000,
  }),
};

/**
 * Show notification with predefined message
 * @param {Function} addNotification - from useNotification hook
 * @param {Object} messageObj - from notificationMessages
 */
export const showNotification = (addNotification, messageObj) => {
  const { message, type, duration } = messageObj;
  addNotification(message, type, duration);
};
