import axios from 'axios';
import { Task } from '../types/task';

class SyncService {
  private static instance: SyncService;
  private syncInProgress: boolean = false;
  private lastSyncTime: number = 0;
  private pendingChanges: any[] = [];

  private constructor() {
    // 每分鐘檢查一次是否需要同步
    setInterval(this.checkAndSync, 60000);
    // 監聽離線/在線事件
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  static getInstance() {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private handleOnline = async () => {
    console.log('網絡已連接，開始同步數據...');
    await this.syncData();
  };

  private handleOffline = () => {
    console.log('網絡已斷開，數據將在本地保存...');
  };

  private async checkAndSync() {
    if (navigator.onLine && !this.syncInProgress) {
      await this.syncData();
    }
  }

  public async syncData() {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    try {
      // 獲取上次同步後的更改
      const changes = await this.getLocalChanges();
      
      // 發送更改到服務器
      if (changes.length > 0) {
        await axios.post('http://localhost:8000/sync', {
          changes,
          lastSyncTime: this.lastSyncTime
        });
      }

      // 獲取服務器端的更改
      const response = await axios.get('http://localhost:8000/sync', {
        params: { lastSyncTime: this.lastSyncTime }
      });

      // 更新本地數據
      await this.updateLocalData(response.data);
      
      this.lastSyncTime = Date.now();
      localStorage.setItem('lastSyncTime', this.lastSyncTime.toString());
      
    } catch (error) {
      console.error('同步失敗:', error);
      // 保存失敗的更改以便稍後重試
      this.pendingChanges.push(...this.getLocalChanges());
    } finally {
      this.syncInProgress = false;
    }
  }

  private async getLocalChanges() {
    // 獲取本地存儲的更改
    const changes = localStorage.getItem('pendingChanges');
    return changes ? JSON.parse(changes) : [];
  }

  private async updateLocalData(serverData: any) {
    // 更新本地存儲的數據
    localStorage.setItem('tasks', JSON.stringify(serverData.tasks));
  }

  public async saveChange(change: any) {
    this.pendingChanges.push(change);
    localStorage.setItem('pendingChanges', JSON.stringify(this.pendingChanges));
    await this.checkAndSync();
  }
}

export default SyncService.getInstance();
