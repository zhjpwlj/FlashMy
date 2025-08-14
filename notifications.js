// 需在 Firebase Console 启用 Cloud Messaging 并配置 Web Push

import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js";
import { app } from "./firebase-config.js";

const messaging = getMessaging(app);

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: 'BIqUkARuPQ9X0SLwyCSzzvyLJvS9qdcQypScLVKBKvPCf7GiqjpJtznBkOCvXQcj1yB0TzzCR7SfmwanClXpggM' });
      console.log('FCM Token:', token);
      // 发送 token 到服务器保存
      return token;
    }
  } catch (err) {
    console.error('获取通知权限失败', err);
  }
}

onMessage(messaging, payload => {
  console.log('收到推送消息：', payload);
  // 这里可自定义显示通知
});
