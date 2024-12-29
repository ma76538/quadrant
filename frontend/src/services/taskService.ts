import axios from 'axios';
import type { Task, TaskCreate, TaskUpdate } from '../types/task';
import authService from './authService';

const API_URL = 'http://localhost:8000';

class TaskService {
  private static instance: TaskService;

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  public async getTasks(): Promise<Task[]> {
    try {
      console.log('獲取任務列表');
      const response = await axios.get<Task[]>(`${API_URL}/tasks`, {
        headers: this.getAuthHeader()
      });
      console.log('獲取任務響應：', response.data);
      return response.data;
    } catch (error: any) {
      console.error('獲取任務錯誤：', error.response || error);
      throw error;
    }
  }

  public async createTask(task: TaskCreate): Promise<Task> {
    try {
      console.log('創建任務請求：', task);
      const response = await axios.post<Task>(`${API_URL}/tasks`, task, {
        headers: this.getAuthHeader()
      });
      console.log('創建任務響應：', response.data);
      return response.data;
    } catch (error: any) {
      console.error('創建任務錯誤：', error.response || error);
      throw error;
    }
  }

  public async updateTask(taskId: number, task: TaskUpdate): Promise<Task> {
    try {
      console.log('更新任務請求：', { taskId, task });
      const response = await axios.put<Task>(`${API_URL}/tasks/${taskId}`, task, {
        headers: this.getAuthHeader()
      });
      console.log('更新任務響應：', response.data);
      return response.data;
    } catch (error: any) {
      console.error('更新任務錯誤：', error.response || error);
      throw error;
    }
  }

  public async deleteTask(taskId: number): Promise<void> {
    try {
      console.log('刪除任務請求：', taskId);
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: this.getAuthHeader()
      });
      console.log('任務刪除成功');
    } catch (error: any) {
      console.error('刪除任務錯誤：', error.response || error);
      throw error;
    }
  }

  public async updateTaskQuadrant(taskId: number, quadrant: number): Promise<void> {
    try {
      console.log('更新任務象限請求：', { taskId, quadrant });
      await axios.put(
        `${API_URL}/tasks/${taskId}/quadrant`,
        { quadrant },
        { headers: this.getAuthHeader() }
      );
      console.log('任務象限更新成功');
    } catch (error: any) {
      console.error('更新任務象限錯誤：', error.response || error);
      throw error;
    }
  }

  private getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default TaskService.getInstance();
