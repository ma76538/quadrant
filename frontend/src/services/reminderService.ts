import dayjs from 'dayjs';
import { Task } from '../types/task';

export const checkAndScheduleReminders = (task: Task) => {
  if (!task.due_date || !task.repeat_type) return;

  const now = dayjs();
  const dueDate = dayjs(task.due_date);
  
  // 檢查是否需要提醒
  if (dueDate.isBefore(now)) {
    // 根據重複類型計算下次提醒時間
    let nextReminder;
    switch (task.repeat_type) {
      case 'daily':
        nextReminder = dueDate.add(1, 'day');
        break;
      case 'weekly':
        nextReminder = dueDate.add(1, 'week');
        break;
      case 'monthly':
        nextReminder = dueDate.add(1, 'month');
        break;
      case 'yearly':
        nextReminder = dueDate.add(1, 'year');
        break;
      default:
        return;
    }

    // 如果啟用了通知權限，則發送通知
    if (Notification.permission === 'granted') {
      new Notification('任務提醒', {
        body: `任務「${task.title}」即將到期`,
        icon: '/favicon.ico'
      });
    }

    return nextReminder.toISOString();
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('此瀏覽器不支持通知功能');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};
