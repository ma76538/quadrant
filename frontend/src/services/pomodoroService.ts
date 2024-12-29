import { notification } from 'antd';

class PomodoroService {
  private static instance: PomodoroService;
  private focusMusic: HTMLAudioElement | null = null;
  private notificationSound: HTMLAudioElement | null = null;

  private constructor() {
    // 初始化音頻
    if (typeof window !== 'undefined') {
      this.focusMusic = new Audio('/focus-music.mp3');
      this.notificationSound = new Audio('/notification.mp3');
      this.focusMusic.loop = true;
    }
  }

  public static getInstance(): PomodoroService {
    if (!PomodoroService.instance) {
      PomodoroService.instance = new PomodoroService();
    }
    return PomodoroService.instance;
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public showNotification(title: string, options: NotificationOptions = {}): void {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
      this.playNotificationSound();
    }
  }

  public enableFocusMode(): void {
    // 檢查是否支持 Page Visibility API
    if (document.hidden !== undefined) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public disableFocusMode(): void {
    if (document.hidden !== undefined) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public playFocusMusic(): void {
    if (this.focusMusic) {
      this.focusMusic.play().catch(error => {
        console.error('Error playing focus music:', error);
      });
    }
  }

  public pauseFocusMusic(): void {
    if (this.focusMusic) {
      this.focusMusic.pause();
    }
  }

  public saveDailyFocusTime(minutes: number): void {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`focusTime_${today}`, minutes.toString());
  }

  public getDailyFocusTime(): number {
    const today = new Date().toISOString().split('T')[0];
    const savedTime = localStorage.getItem(`focusTime_${today}`);
    return savedTime ? parseInt(savedTime) : 0;
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      notification.warning({
        message: '專注模式',
        description: '請回到專注任務！',
        duration: 0,
      });
    }
  };

  private playNotificationSound(): void {
    if (this.notificationSound) {
      this.notificationSound.play().catch(error => {
        console.error('Error playing notification sound:', error);
      });
    }
  }
}

export default PomodoroService.getInstance();
