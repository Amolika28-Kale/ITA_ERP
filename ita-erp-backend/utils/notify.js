const Notification = require("../models/Notification");

exports.sendNotification = async ({
  users = [],
  title,
  message,
  type = "system",
  entityType = null,
  entityId = null
}) => {
  if (!users.length) return;

  const payload = users.map(userId => ({
    user: userId,
    title,
    message,
    type,
    entityType,
    entityId
  }));

  await Notification.insertMany(payload);
};
