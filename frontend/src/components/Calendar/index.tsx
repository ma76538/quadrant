import React, { useState } from 'react';
import { Calendar as AntCalendar, Badge, Modal, Form, Input, DatePicker, Switch, Select, Button } from 'antd';
import type { Moment } from 'moment';
import styled from 'styled-components';
import type { BadgeProps } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';

const { Option } = Select;

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  isAllDay: boolean;
  description?: string;
}

const StyledCalendarCard = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const EventForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 16px;
  }
`;

const CalendarComponent: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Moment | null>(null);
  const [form] = Form.useForm();
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');

  const getListData = (value: Moment) => {
    const dateStr = value.format('YYYY-MM-DD');
    return events.filter(event => event.date === dateStr);
  };

  const dateCellRender = (value: Moment) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item) => (
          <li key={item.id}>
            <Badge
              status={item.type as BadgeProps['status']}
              text={item.title}
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleDateSelect = (date: Moment) => {
    setSelectedDate(date);
    setIsModalVisible(true);
    form.setFieldsValue({
      date: dayjs(date.format('YYYY-MM-DD')),
      isAllDay: true,
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: values.title,
        date: values.date.format('YYYY-MM-DD'),
        type: values.type,
        isAllDay: values.isAllDay,
        description: values.description,
      };

      setEvents([...events, newEvent]);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const goToToday = () => {
    const today = dayjs();
    // 觸發日曆組件更新到今天
    if (calendarView === 'month') {
      setCalendarView('week');
      setTimeout(() => setCalendarView('month'), 0);
    } else {
      setCalendarView('month');
      setTimeout(() => setCalendarView('week'), 0);
    }
  };

  return (
    <StyledCalendarCard>
      <HeaderActions>
        <Select
          value={calendarView}
          onChange={setCalendarView}
          style={{ width: 120 }}
        >
          <Option value="month">月視圖</Option>
          <Option value="week">週視圖</Option>
        </Select>
        <Button type="primary" onClick={goToToday}>
          今天
        </Button>
      </HeaderActions>

      <AntCalendar
        mode={calendarView}
        dateCellRender={dateCellRender}
        onSelect={handleDateSelect}
        locale={{
          lang: {
            locale: 'zh-tw',
            month: '月',
            year: '年',
            today: '今天',
            monthSelect: '選擇月份',
            yearSelect: '選擇年份',
            dateSelect: '選擇日期',
            dayFormat: '日',
            dateFormat: 'YYYY-MM-DD',
            monthFormat: 'M月',
            yearFormat: 'YYYY年',
            previousMonth: '上個月',
            nextMonth: '下個月',
            previousYear: '上一年',
            nextYear: '下一年',
          }
        }}
      />

      <Modal
        title="新增事項"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <EventForm form={form} layout="vertical">
          <Form.Item
            name="title"
            label="標題"
            rules={[{ required: true, message: '請輸入標題' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '請選擇日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="type"
            label="類型"
            initialValue="processing"
          >
            <Select>
              <Option value="success">完成</Option>
              <Option value="processing">進行中</Option>
              <Option value="error">重要</Option>
              <Option value="warning">提醒</Option>
              <Option value="default">一般</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isAllDay"
            label="全天事項"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
          </Form.Item>
        </EventForm>
      </Modal>
    </StyledCalendarCard>
  );
};

export default CalendarComponent;
