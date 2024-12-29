import React, { useState, useEffect } from 'react';
import { Timeline, Card, Button, Modal, Form, Input, DatePicker, TimePicker, Switch, message, Select, Space } from 'antd';
import { PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  completed: boolean;
  notification: boolean;
  type: 'daily' | 'weekly' | 'summary';
}

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const TimelineItem = styled(Timeline.Item)`
  .ant-timeline-item-content {
    width: 100%;
    margin-left: 24px;
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const FilterContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ScheduleComponent: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'summary'>('all');
  const [reverseOrder, setReverseOrder] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // 從 localStorage 加載日程
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  useEffect(() => {
    // 保存日程到 localStorage
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...schedule,
      date: dayjs(schedule.date),
      time: schedule.time ? dayjs(schedule.time, 'HH:mm') : undefined
    });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    message.success('日程已刪除');
  };

  const handleToggleComplete = (scheduleId: string) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, completed: !schedule.completed }
        : schedule
    ));
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const scheduleItem: ScheduleItem = {
        id: editingSchedule?.id || Date.now().toString(),
        title: values.title,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time?.format('HH:mm'),
        completed: editingSchedule?.completed || false,
        notification: values.notification,
        type: values.type
      };

      if (editingSchedule) {
        setSchedules(schedules.map(schedule =>
          schedule.id === editingSchedule.id ? scheduleItem : schedule
        ));
        message.success('日程已更新');
      } else {
        setSchedules([scheduleItem, ...schedules]);
        message.success('日程已創建');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const getFilteredSchedules = () => {
    let filtered = schedules;
    if (filterType !== 'all') {
      filtered = schedules.filter(schedule => schedule.type === filterType);
    }
    return reverseOrder ? [...filtered].reverse() : filtered;
  };

  const scheduleTypeColors = {
    daily: '#1890ff',
    weekly: '#52c41a',
    summary: '#722ed1'
  };

  return (
    <div>
      <FilterContainer>
        <Select
          value={filterType}
          onChange={setFilterType}
          style={{ width: 120 }}
        >
          <Option value="all">全部</Option>
          <Option value="daily">每日計劃</Option>
          <Option value="weekly">每週計劃</Option>
          <Option value="summary">總結</Option>
        </Select>
        <Switch
          checkedChildren="逆序"
          unCheckedChildren="正序"
          checked={reverseOrder}
          onChange={setReverseOrder}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSchedule}>
          新增日程
        </Button>
      </FilterContainer>

      <Timeline mode="left">
        {getFilteredSchedules().map(schedule => (
          <TimelineItem
            key={schedule.id}
            color={scheduleTypeColors[schedule.type]}
            dot={schedule.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          >
            <StyledCard>
              <h4>{schedule.title}</h4>
              <p>{schedule.description}</p>
              <p>
                {schedule.date}
                {schedule.time && ` ${schedule.time}`}
              </p>
              <ItemActions>
                <Button
                  type={schedule.completed ? 'primary' : 'default'}
                  onClick={() => handleToggleComplete(schedule.id)}
                >
                  {schedule.completed ? '已完成' : '完成'}
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEditSchedule(schedule)}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteSchedule(schedule.id)}
                />
              </ItemActions>
            </StyledCard>
          </TimelineItem>
        ))}
      </Timeline>

      <Modal
        title={editingSchedule ? '編輯日程' : '新增日程'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'daily',
            notification: true
          }}
        >
          <Form.Item
            name="title"
            label="標題"
            rules={[{ required: true, message: '請輸入標題' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="type"
            label="類型"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="daily">每日計劃</Option>
              <Option value="weekly">每週計劃</Option>
              <Option value="summary">總結</Option>
            </Select>
          </Form.Item>

          <Space>
            <Form.Item
              name="date"
              label="日期"
              rules={[{ required: true, message: '請選擇日期' }]}
            >
              <DatePicker />
            </Form.Item>

            <Form.Item
              name="time"
              label="時間"
            >
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Space>

          <Form.Item
            name="notification"
            label="通知提醒"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleComponent;
