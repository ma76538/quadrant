import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Rate, Timeline, Select, DatePicker } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined, HeartOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';

const { RangePicker } = DatePicker;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const ChartCard = styled(Card)`
  margin-bottom: 16px;
  height: 400px;
`;

const MoodContainer = styled.div`
  text-align: center;
  margin: 16px 0;
`;

interface DailyStats {
  date: string;
  completed: number;
  total: number;
  focusHours: number;
  mood: number;
}

const StatisticsComponent: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [todayMood, setTodayMood] = useState(3);
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    // 從 localStorage 加載數據
    loadStatistics();
  }, [dateRange, viewType]);

  const loadStatistics = () => {
    // 模擬加載歷史數據
    const stats: DailyStats[] = [];
    const [startDate, endDate] = dateRange;
    let currentDate = startDate.clone();

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const randomCompleted = Math.floor(Math.random() * 10);
      const randomTotal = randomCompleted + Math.floor(Math.random() * 5);
      stats.push({
        date: currentDate.format('YYYY-MM-DD'),
        completed: randomCompleted,
        total: randomTotal,
        focusHours: Math.random() * 8,
        mood: Math.floor(Math.random() * 5) + 1
      });
      currentDate = currentDate.add(1, 'day');
    }

    setDailyStats(stats);
  };

  const calculateStatistics = () => {
    const totalDays = dailyStats.length;
    const totalCompleted = dailyStats.reduce((sum, stat) => sum + stat.completed, 0);
    const totalTasks = dailyStats.reduce((sum, stat) => sum + stat.total, 0);
    const totalFocusHours = dailyStats.reduce((sum, stat) => sum + stat.focusHours, 0);
    const averageMood = dailyStats.reduce((sum, stat) => sum + stat.mood, 0) / totalDays;

    return {
      totalDays,
      totalCompleted,
      totalTasks,
      completionRate: (totalCompleted / totalTasks) * 100,
      totalFocusHours,
      averageMood
    };
  };

  const stats = calculateStatistics();

  const getChartData = () => {
    return dailyStats.map(stat => ({
      date: stat.date,
      value: stat.completed,
      category: '已完成任務'
    })).concat(
      dailyStats.map(stat => ({
        date: stat.date,
        value: stat.focusHours,
        category: '專注時間（小時）'
      }))
    );
  };

  const config = {
    data: getChartData(),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1500
      }
    }
  };

  const calculateTenThousandHours = () => {
    const totalHours = stats.totalFocusHours;
    const remainingHours = 10000 - totalHours;
    const progress = (totalHours / 10000) * 100;
    return { totalHours, remainingHours, progress };
  };

  const tenThousandHours = calculateTenThousandHours();

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="自動天數"
              value={stats.totalDays}
              prefix={<CalendarOutlined />}
              suffix="天"
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="已完成任務"
              value={stats.totalCompleted}
              prefix={<CheckCircleOutlined />}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="待完成任務"
              value={stats.totalTasks - stats.totalCompleted}
              prefix={<ClockCircleOutlined />}
            />
          </StyledCard>
        </Col>
        <Col span={6}>
          <StyledCard>
            <Statistic
              title="完成率"
              value={stats.completionRate}
              precision={2}
              suffix="%"
            />
          </StyledCard>
        </Col>
      </Row>

      <StyledCard title="一萬小時定律追蹤">
        <Progress
          percent={tenThousandHours.progress}
          status="active"
          format={percent => `${tenThousandHours.totalHours.toFixed(1)}小時 / 10000小時`}
        />
        <p>還需要 {tenThousandHours.remainingHours.toFixed(1)} 小時</p>
      </StyledCard>

      <Row gutter={16}>
        <Col span={12}>
          <StyledCard title="數據篩選">
            <Space direction="vertical" style={{ width: '100%' }}>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates)}
              />
              <Select
                value={viewType}
                onChange={setViewType}
                style={{ width: 120 }}
              >
                <Option value="daily">每日</Option>
                <Option value="weekly">每週</Option>
                <Option value="monthly">每月</Option>
              </Select>
            </Space>
          </StyledCard>
        </Col>
        <Col span={12}>
          <StyledCard title="今日心情">
            <MoodContainer>
              <Rate
                character={<HeartOutlined />}
                value={todayMood}
                onChange={setTodayMood}
              />
            </MoodContainer>
          </StyledCard>
        </Col>
      </Row>

      <ChartCard title="趨勢圖表">
        <Line {...config} />
      </ChartCard>

      <StyledCard title="每日回顧">
        <Timeline mode="left">
          {dailyStats.slice(-5).map(stat => (
            <Timeline.Item
              key={stat.date}
              color={stat.completed > 0 ? 'green' : 'gray'}
            >
              <p>{stat.date}</p>
              <p>完成任務：{stat.completed} / {stat.total}</p>
              <p>專注時間：{stat.focusHours.toFixed(1)}小時</p>
              <p>心情指數：<Rate disabled value={stat.mood} /></p>
            </Timeline.Item>
          ))}
        </Timeline>
      </StyledCard>
    </div>
  );
};

export default StatisticsComponent;
