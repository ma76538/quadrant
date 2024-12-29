import React from 'react';
import { Card, Input, Select, DatePicker, Space } from 'antd';
import styled from 'styled-components';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const FilterCard = styled(Card)`
  margin-bottom: 16px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

interface TaskFilterProps {
  onSearch: (value: string) => void;
  onFilterChange: (filters: any) => void;
  filters: {
    status: string;
    timeRange: string;
    repeatType: string;
  };
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  onSearch,
  onFilterChange,
  filters,
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <FilterCard>
      <FilterContainer>
        <Input
          placeholder="搜索任務..."
          prefix={<SearchOutlined />}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 200 }}
        />
        
        <Select
          style={{ width: 120 }}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="狀態"
        >
          <Option value="all">全部顯示</Option>
          <Option value="active">進行中</Option>
          <Option value="completed">已完成</Option>
          <Option value="archived">已歸檔</Option>
        </Select>

        <Select
          style={{ width: 120 }}
          value={filters.timeRange}
          onChange={(value) => handleFilterChange('timeRange', value)}
          placeholder="時間範圍"
        >
          <Option value="all">全部時間</Option>
          <Option value="today">今天</Option>
          <Option value="tomorrow">明天</Option>
          <Option value="week">本週</Option>
          <Option value="month">本月</Option>
        </Select>

        <Select
          style={{ width: 120 }}
          value={filters.repeatType}
          onChange={(value) => handleFilterChange('repeatType', value)}
          placeholder="重複類型"
        >
          <Option value="all">全部類型</Option>
          <Option value="none">不重複</Option>
          <Option value="daily">每天</Option>
          <Option value="weekly">每週</Option>
          <Option value="monthly">每月</Option>
          <Option value="yearly">每年</Option>
        </Select>
      </FilterContainer>
    </FilterCard>
  );
};

export default TaskFilter;
