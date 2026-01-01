import React from "react";
import { useNotification } from "../../context/NotificationContext";
import "./Notification.scss";

const Notification = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`notification notification-${notif.type}`}
        >
          <div className="notification-content">
            <span className="notification-message">{notif.message}</span>
            <button
              className="notification-close"
              onClick={() => removeNotification(notif.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
