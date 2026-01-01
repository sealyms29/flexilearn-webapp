# Notification System Implementation Guide

## 📋 Overview

A complete real-time notification system has been implemented to enhance the user experience in FlexiLearn's messaging feature. The system includes:

- **Toast notifications** (success, error, warning, info)
- **Unread message badges** in navbar
- **Auto-scroll** to latest messages
- **Message send status** feedback
- **Auto-refetch** for new conversations every 10 seconds

---

## 📁 Files Created/Modified

### **New Files (3)**

1. **[client/src/context/NotificationContext.jsx](client/src/context/NotificationContext.jsx)**
   - React Context for global notification state management
   - Provides `useNotification` hook
   - Methods: `addNotification()`, `removeNotification()`, `clearNotifications()`

2. **[client/src/components/notification/Notification.jsx](client/src/components/notification/Notification.jsx)**
   - Toast notification display component
   - Renders all notifications in queue
   - Auto-dismisses with close button

3. **[client/src/components/notification/Notification.scss](client/src/components/notification/Notification.scss)**
   - Styling for toast notifications
   - Supports 4 types: success, error, warning, info
   - Slide-in animation

4. **[client/src/hooks/useUnreadMessages.js](client/src/hooks/useUnreadMessages.js)**
   - Custom hook to fetch unread message count
   - Handles buyer/seller role differentiation
   - Auto-refetches every 10 seconds

5. **[client/src/utils/notificationHelpers.js](client/src/utils/notificationHelpers.js)**
   - Predefined notification message constants
   - Helper function `showNotification()`
   - Reusable across the app

### **Modified Files (4)**

1. **[client/src/App.jsx](client/src/App.jsx)**
   - Wrapped Layout with `<NotificationProvider>`
   - Added `<Notification />` component
   - Ensures notifications available globally

2. **[client/src/components/navbar/Navbar.jsx](client/src/components/navbar/Navbar.jsx)**
   - Added `useUnreadMessagesCount` hook
   - Displays unread badge on Messages link
   - Badge shows count only if > 0

3. **[client/src/components/navbar/Navbar.scss](client/src/components/navbar/Navbar.scss)**
   - Added `.unread-badge` styling
   - Red circular badge with count
   - Positioned inside Messages link

4. **[client/src/pages/message/Message.jsx](client/src/pages/message/Message.jsx)**
   - Added `useNotification` hook
   - Toast on message send success/failure
   - Auto-scroll to latest message
   - Disabled button during send

5. **[client/src/pages/messages/Messages.jsx](client/src/pages/messages/Messages.jsx)**
   - Added `useNotification` hook
   - Toast on mark as read success/failure
   - Auto-refetch conversations every 10 seconds

---

## 🎯 Features Implemented

### 1. **Global Notification System**

```jsx
// Usage anywhere in the app
import { useNotification } from "@/context/NotificationContext";

const MyComponent = () => {
  const { addNotification } = useNotification();

  const handleAction = () => {
    addNotification("Action successful!", "success", 2000);
  };

  return <button onClick={handleAction}>Do Something</button>;
};
```

### 2. **Unread Message Badge**

- Displays in navbar Messages link
- Updates every 10 seconds
- Shows red circular badge with count
- Role-aware (buyer/seller)
- Only visible when count > 0

### 3. **Toast Notifications**

**Types:**
- `success` - Green background
- `error` - Red background
- `warning` - Yellow background
- `info` - Blue background (default)

**Features:**
- Auto-dismiss after duration (default: 3000ms)
- Manual close button
- Stacks vertically if multiple
- Slide-in animation
- Top-right positioning (responsive)

### 4. **Message Sending Feedback**

- Loading state on button during send
- Success notification on successful send
- Error notification on failure
- Empty message validation

### 5. **Auto-Scroll**

- Automatically scrolls to latest message when new message is added
- Uses `useRef` and `scrollIntoView` with smooth behavior

### 6. **Auto-Refetch**

- Conversations list refetches every 10 seconds
- Ensures new messages appear without manual refresh
- Only triggers for authenticated users

---

## 💡 Usage Examples

### **Sending a Toast Notification**

```jsx
import { useNotification } from "@/context/NotificationContext";

const MyComponent = () => {
  const { addNotification } = useNotification();

  const handleClick = async () => {
    try {
      await someAsyncAction();
      addNotification("Success!", "success", 2000);
    } catch (err) {
      addNotification("Something went wrong", "error", 3000);
    }
  };

  return <button onClick={handleClick}>Action</button>;
};
```

### **Using Predefined Messages**

```jsx
import { notificationMessages, showNotification } from "@/utils/notificationHelpers";
import { useNotification } from "@/context/NotificationContext";

const MyComponent = () => {
  const { addNotification } = useNotification();

  const handleSendMessage = () => {
    try {
      // Send message logic
      showNotification(addNotification, notificationMessages.messageSent);
    } catch (err) {
      showNotification(addNotification, notificationMessages.messageSendError);
    }
  };

  return <button onClick={handleSendMessage}>Send</button>;
};
```

### **Checking Unread Count**

```jsx
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessages";

const MyComponent = () => {
  const unreadCount = useUnreadMessagesCount();

  return <span>You have {unreadCount} unread messages</span>;
};
```

---

## 🎨 Notification Styling

### **Toast Colors**

| Type | Background | Text |
|------|-----------|------|
| success | #d4edda | #155724 |
| error | #f8d7da | #721c24 |
| warning | #fff3cd | #856404 |
| info | #d1ecf1 | #0c5460 |

### **Badge Styling**

- Background: Red (#DC2626)
- Text: White
- Shape: Circular
- Size: 20px × 20px
- Position: Inside Messages link in navbar

---

## 🔄 Data Flow

```
┌─────────────────────────────────────┐
│     User Action (send message)      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Message.jsx handles submit        │
│   → API call via newRequest          │
└────────────┬────────────────────────┘
             │
             ├─── Success ───────────────┐
             │                           │
             │                    addNotification()
             │                    "Message sent!"
             │                           │
             │                           ▼
             │                  Toast appears for 2s
             │
             └─── Error ────────────────┐
                                        │
                                 addNotification()
                                 "Failed to send"
                                        │
                                        ▼
                                 Toast appears for 3s
```

---

## ⚙️ Configuration

### **Notification Duration**

Edit [client/src/context/NotificationContext.jsx](client/src/context/NotificationContext.jsx):

```jsx
// Change default duration (in milliseconds)
setTimeout(() => {
  removeNotification(id);
}, duration); // Currently: 3000ms
```

### **Auto-Refetch Interval**

Edit [client/src/hooks/useUnreadMessages.js](client/src/hooks/useUnreadMessages.js):

```jsx
refetchInterval: 10000, // Change to desired milliseconds
```

### **Badge Position**

Edit [client/src/components/navbar/Navbar.scss](client/src/components/navbar/Navbar.scss):

```scss
.unread-badge {
  width: 20px;        // Adjust size
  height: 20px;
  background-color: #DC2626; // Change color
}
```

---

## 🧪 Testing

### **Test Notification Display**

```jsx
// In any component
const { addNotification } = useNotification();

addNotification("Test success", "success");
addNotification("Test error", "error");
addNotification("Test warning", "warning");
addNotification("Test info", "info");
```

### **Test Unread Badge**

1. Create conversation as buyer
2. Send message as seller
3. Badge should appear in navbar with count
4. Mark as read
5. Badge should disappear

### **Test Auto-Scroll**

1. Open message chat
2. Send multiple messages
3. View should auto-scroll to latest

---

## 🔐 Security Notes

✅ **Secure Implementation:**
- No XSS vulnerabilities (React auto-escapes text)
- Notifications don't expose sensitive data
- Role-based badge display (buyer/seller aware)
- JWT authenticated API calls

---

## 📱 Responsive Design

- Notifications adjust position on mobile
- Badge scales with navbar
- Touch-friendly close button
- Toast width adjusts on smaller screens

---

## 🚀 Future Enhancements

1. **Sound Notifications** - Add audio alert for new messages
2. **Desktop Notifications** - Web Push API integration
3. **Notification History** - Store notification log
4. **Notification Settings** - User preferences for types
5. **Typing Indicators** - Show "User is typing..."
6. **Read Receipts** - Show message read status
7. **Persistent Notifications** - DB-backed notification system

---

## 📞 Support

For issues or questions about the notification system:
1. Check React Query documentation for data fetching
2. Verify NotificationProvider wraps app in App.jsx
3. Ensure useNotification hook is only used inside NotificationProvider
4. Check browser console for error messages

