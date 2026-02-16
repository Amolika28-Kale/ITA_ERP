const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendMail } = require("./mail");

exports.sendNotification = async ({
  users = [],
  title,
  message,
  type = "system",
  entityType = null,
  entityId = null,
  sendEmail = true,
}) => {
  if (!users.length) return;

  // 🔔 Save notifications
  await Notification.insertMany(
    users.map((userId) => ({
      user: userId,
      title,
      message,
      type,
      entityType,
      entityId,
    }))
  );

  if (!sendEmail) return;

  const userDocs = await User.find({
    _id: { $in: users },
  }).select("email name");

  await Promise.all(
    userDocs
      .filter((u) => u.email)
      .map(async (user) => {
        try {
          await sendMail({
            to: user.email,
            subject: title,
            html: `
              <h3>${title}</h3>
              <p>${message}</p>
              <br/>
              <small>ITA-ERP Notification</small>
            `,
          });
        } catch (err) {
          console.error("Email failed:", user.email);
        }
      })
  );
};
