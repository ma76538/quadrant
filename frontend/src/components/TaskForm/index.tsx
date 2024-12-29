import React from 'react';
import { Modal, Form, Input, DatePicker, Select, Switch } from 'antd';
import { Task } from '../../types/task';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<Task>;
  title: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  title,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('表單驗證失敗:', error);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...initialValues,
          due_date: initialValues?.due_date ? dayjs(initialValues.due_date) : undefined,
        }}
      >
        <Form.Item
          name="title"
          label="標題"
          rules={[{ required: true, message: '請輸入任務標題' }]}
        >
          <Input placeholder="輸入任務標題" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={4} placeholder="輸入任務描述" />
        </Form.Item>

        <Form.Item
          name="quadrant"
          label="象限"
          rules={[{ required: true, message: '請選擇象限' }]}
        >
          <Select placeholder="選擇象限">
            <Option value={0}>重要且緊急</Option>
            <Option value={1}>重要不緊急</Option>
            <Option value={2}>緊急不重要</Option>
            <Option value={3}>不重要不緊急</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="due_date"
          label="截止日期"
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder="選擇截止日期和時間"
          />
        </Form.Item>

        <Form.Item
          name="repeat_type"
          label="重複"
        >
          <Select placeholder="選擇重複類型">
            <Option value="">不重複</Option>
            <Option value="daily">每天</Option>
            <Option value="weekly">每週</Option>
            <Option value="monthly">每月</Option>
            <Option value="yearly">每年</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="is_all_day"
          label="全天事項"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskForm;
