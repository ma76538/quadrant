import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Typography, Button, message } from 'antd';
import { PlusOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import TaskForm from '../TaskForm';
import axios from 'axios';
import { Task } from '../../types/task';

const { Title } = Typography;

const QuadrantContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  height: calc(100vh - 64px);
  background-color: #f0f2f5;
  position: relative;
`;

const QuadrantSection = styled.div<{ isDraggingOver: boolean }>`
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  margin: 8px;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  background-color: ${props => props.isDraggingOver ? '#e6f7ff' : 'white'};
`;

const TaskCard = styled(Card)<{ isDragging: boolean }>`
  margin-bottom: 8px;
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  opacity: ${props => props.isDragging ? 0.5 : 1};
`;

const CenterCircle = styled.div<{ isExpanded: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background-color: #1890ff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 100;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const AddTaskButton = styled(Button)`
  margin-bottom: 16px;
  width: 100%;
`;

const ActionButton = styled(Button)`
  margin-left: 8px;
`;

const quadrantTitles = [
  '重要且緊急',
  '重要不緊急',
  '緊急不重要',
  '不重要不緊急'
];

const QuadrantView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedQuadrant, setExpandedQuadrant] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState('新增任務');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/tasks/');
      setTasks(response.data);
    } catch (error) {
      message.error('獲取任務失敗');
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceQuadrant = parseInt(result.source.droppableId);
    const destinationQuadrant = parseInt(result.destination.droppableId);
    
    const taskId = parseInt(result.draggableId);
    
    try {
      await axios.put(`http://localhost:8000/tasks/${taskId}/quadrant`, {
        quadrant: destinationQuadrant
      });
      
      const updatedTasks = [...tasks];
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex].quadrant = destinationQuadrant;
      }
      setTasks(updatedTasks);
      
      message.success('已更新任務象限');
    } catch (error) {
      message.error('更新任務失敗');
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormTitle('新增任務');
    setIsFormVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormTitle('編輯任務');
    setIsFormVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingTask) {
        await axios.put(`http://localhost:8000/tasks/${editingTask.id}`, values);
        message.success('任務已更新');
      } else {
        await axios.post('http://localhost:8000/tasks/', values);
        message.success('任務已創建');
      }
      setIsFormVisible(false);
      fetchTasks();
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await axios.put(`http://localhost:8000/tasks/${task.id}`, {
        ...task,
        completed: !task.completed
      });
      fetchTasks();
      message.success(task.completed ? '任務已重新開啟' : '任務已完成');
    } catch (error) {
      message.error('操作失敗');
    }
  };

  const toggleQuadrantExpansion = (quadrant: number) => {
    setExpandedQuadrant(expandedQuadrant === quadrant ? null : quadrant);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <QuadrantContainer>
          {[0, 1, 2, 3].map((quadrant) => (
            <Droppable key={quadrant} droppableId={quadrant.toString()}>
              {(provided, snapshot) => (
                <QuadrantSection
                  ref={provided.innerRef}
                  isDraggingOver={snapshot.isDraggingOver}
                  {...provided.droppableProps}
                >
                  <Title level={4}>{quadrantTitles[quadrant]}</Title>
                  <AddTaskButton
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddTask}
                  >
                    新增任務
                  </AddTaskButton>
                  {tasks
                    .filter(task => task.quadrant === quadrant)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TaskCard
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            isDragging={snapshot.isDragging}
                            size="small"
                            title={task.title}
                            extra={
                              <>
                                <ActionButton
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditTask(task)}
                                />
                                <ActionButton
                                  type="text"
                                  icon={<CheckOutlined />}
                                  onClick={() => handleToggleComplete(task)}
                                  style={{ color: task.completed ? '#52c41a' : undefined }}
                                />
                              </>
                            }
                          >
                            {task.description}
                          </TaskCard>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </QuadrantSection>
              )}
            </Droppable>
          ))}
          <CenterCircle
            isExpanded={expandedQuadrant !== null}
            onClick={() => toggleQuadrantExpansion(0)}
          >
            ⚡
          </CenterCircle>
        </QuadrantContainer>
      </DragDropContext>
      
      <TaskForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingTask || undefined}
        title={formTitle}
      />
    </>
  );
};

export default QuadrantView;
