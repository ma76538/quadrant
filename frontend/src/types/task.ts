export interface Task {
  id: number;
  title: string;
  description?: string;
  quadrant: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  quadrant: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  quadrant?: number;
  completed?: boolean;
}
