from datetime import datetime
from sqlalchemy.orm import Session
from . import models

def process_sync_request(db: Session, changes: list, last_sync_time: float):
    """處理同步請求"""
    server_changes = []
    
    # 處理客戶端的更改
    for change in changes:
        if change['type'] == 'create':
            task = models.Task(**change['data'])
            db.add(task)
            server_changes.append({
                'type': 'create',
                'data': task
            })
        elif change['type'] == 'update':
            task = db.query(models.Task).filter(models.Task.id == change['data']['id']).first()
            if task:
                for key, value in change['data'].items():
                    setattr(task, key, value)
                server_changes.append({
                    'type': 'update',
                    'data': task
                })
        elif change['type'] == 'delete':
            task = db.query(models.Task).filter(models.Task.id == change['data']['id']).first()
            if task:
                db.delete(task)
                server_changes.append({
                    'type': 'delete',
                    'data': {'id': task.id}
                })
    
    # 獲取服務器端的更改
    server_tasks = db.query(models.Task).filter(
        models.Task.updated_at > datetime.fromtimestamp(last_sync_time / 1000)
    ).all()
    
    for task in server_tasks:
        server_changes.append({
            'type': 'update',
            'data': task
        })
    
    db.commit()
    return server_changes

def get_tasks_for_sync(db: Session, last_sync_time: float):
    """獲取上次同步後更改的任務"""
    return db.query(models.Task).filter(
        models.Task.updated_at > datetime.fromtimestamp(last_sync_time / 1000)
    ).all()
