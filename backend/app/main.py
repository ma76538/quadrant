from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from . import models, database, sync, auth
from datetime import datetime, timedelta
from pydantic import BaseModel

# Pydantic models
class TaskBase(BaseModel):
    title: str
    description: str | None = None
    quadrant: int

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    quadrant: int | None = None
    completed: bool | None = None

class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        from_attributes = True

app = FastAPI(title="Quadrant ToDo API")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 創建數據庫表
models.Base.metadata.create_all(bind=database.engine)

@app.post("/register", response_model=auth.User)
def register(user: auth.UserCreate, db: Session = Depends(database.get_db)):
    try:
        db_user = auth.get_user(db, username=user.username)
        if db_user:
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
        return auth.create_user(db=db, user=user)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/users/me", response_model=auth.User)
async def read_users_me(current_user: auth.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/")
async def root():
    return {"message": "歡迎使用肥牛待辦事項 API"}

# Task routes
@app.get("/tasks", response_model=List[Task])
def get_tasks(
    current_user: auth.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    return tasks

@app.post("/tasks", response_model=Task)
def create_task(
    task: TaskCreate,
    current_user: auth.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_task = models.Task(**task.dict(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task: TaskUpdate,
    current_user: auth.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task.dict(exclude_unset=True).items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user: auth.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.user_id == current_user.id
    ).first()
    
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

@app.get("/tasks/", response_model=List[Task])
def get_tasks(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 100,
    quadrant: int = None,
    show_archived: bool = False,
    search: str = None,
    status: str = None,
    time_range: str = None,
    repeat_type: str = None
):
    query = db.query(models.Task)
    
    # 基本過濾
    if quadrant is not None:
        query = query.filter(models.Task.quadrant == quadrant)
    if not show_archived:
        query = query.filter(models.Task.archived == False)
    
    # 搜索
    if search:
        query = query.filter(
            models.Task.title.ilike(f"%{search}%") |
            models.Task.description.ilike(f"%{search}%")
        )
    
    # 狀態過濾
    if status == "completed":
        query = query.filter(models.Task.completed == True)
    elif status == "active":
        query = query.filter(models.Task.completed == False)
    
    # 時間範圍過濾
    now = datetime.utcnow()
    if time_range == "today":
        query = query.filter(
            models.Task.due_date >= now.replace(hour=0, minute=0, second=0),
            models.Task.due_date < now.replace(hour=23, minute=59, second=59)
        )
    elif time_range == "week":
        start_of_week = now - timedelta(days=now.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        query = query.filter(
            models.Task.due_date >= start_of_week,
            models.Task.due_date <= end_of_week
        )
    
    # 重複類型過濾
    if repeat_type and repeat_type != "all":
        query = query.filter(models.Task.repeat_type == repeat_type)
    
    return query.offset(skip).limit(limit).all()

@app.post("/tasks/", response_model=Task)
def create_task(task: TaskCreate, db: Session = Depends(database.get_db)):
    try:
        db_task = models.Task(**task.dict())
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(database.get_db)):
    try:
        db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if db_task is None:
            raise HTTPException(status_code=404, detail="任務不存在")
        
        for key, value in task.dict(exclude_unset=True).items():
            setattr(db_task, key, value)
        
        db.commit()
        db.refresh(db_task)
        return db_task
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.put("/tasks/{task_id}/quadrant")
def update_task_quadrant(task_id: int, quadrant: int, db: Session = Depends(database.get_db)):
    try:
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if task is None:
            raise HTTPException(status_code=404, detail="任務不存在")
        task.quadrant = quadrant
        db.commit()
        return {"message": "已更新任務象限"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(database.get_db)):
    try:
        task = db.query(models.Task).filter(models.Task.id == task_id).first()
        if task is None:
            raise HTTPException(status_code=404, detail="任務不存在")
        db.delete(task)
        db.commit()
        return {"message": "任務已刪除"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/sync")
def sync_data(sync_request: SyncRequest, db: Session = Depends(database.get_db)):
    try:
        changes = sync.process_sync_request(
            db,
            sync_request.changes,
            sync_request.lastSyncTime
        )
        return {"changes": changes}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/sync")
def get_sync_changes(last_sync_time: float, db: Session = Depends(database.get_db)):
    try:
        changes = sync.get_tasks_for_sync(db, last_sync_time)
        return {"changes": changes}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
