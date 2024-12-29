import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Progress, Switch, Select, InputNumber, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, RedoOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { Option } = Select;

const TimerCard = styled(Card)`
  max-width: 400px;
  margin: 20px auto;
`;

const TimerDisplay = styled.div`
  font-size: 48px;
  text-align: center;
  margin: 20px 0;
  font-family: monospace;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const SettingsContainer = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

interface PomodoroTimerProps {
  onFocusStart?: () => void;
  onFocusEnd?: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onFocusStart,
  onFocusEnd,
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 默認25分鐘
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [countDirection, setCountDirection] = useState<'up' | 'down'>('down');
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [dailyFocusTime, setDailyFocusTime] = useState(0);
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 初始化音頻
    audioRef.current = new Audio('/focus-music.mp3');
    audioRef.current.loop = true;

    // 載入今日專注時間
    const today = dayjs().format('YYYY-MM-DD');
    const savedFocusTime = localStorage.getItem(`focusTime_${today}`);
    if (savedFocusTime) {
      setDailyFocusTime(parseInt(savedFocusTime));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (countDirection === 'down') {
            if (prev <= 1) {
              handleTimerComplete();
              return isBreak ? workDuration * 60 : breakDuration * 60;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });

        // 更新今日專注時間
        if (!isBreak) {
          const today = dayjs().format('YYYY-MM-DD');
          setDailyFocusTime(prev => {
            const newTime = prev + 1;
            localStorage.setItem(`focusTime_${today}`, newTime.toString());
            return newTime;
          });
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, countDirection, isBreak, workDuration, breakDuration]);

  useEffect(() => {
    if (backgroundMusic && isRunning && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [backgroundMusic, isRunning]);

  const handleTimerComplete = () => {
    if (isBreak) {
      message.success('休息結束！開始新的專注時段');
      setIsBreak(false);
      if (onFocusStart) onFocusStart();
    } else {
      message.success('專注時段完成！開始休息');
      setIsBreak(true);
      if (onFocusEnd) onFocusEnd();
    }

    // 播放提示音
    const notification = new Audio('/notification.mp3');
    notification.play();
  };

  const toggleTimer = () => {
    if (!isRunning && !isBreak) {
      if (focusMode) {
        // 請求通知權限
        Notification.requestPermission();
      }
      if (onFocusStart) onFocusStart();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(workDuration * 60);
    setIsBreak(false);
    if (onFocusEnd) onFocusEnd();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    const totalSeconds = isBreak ? breakDuration * 60 : workDuration * 60;
    if (countDirection === 'down') {
      return (timeLeft / totalSeconds) * 100;
    } else {
      return ((totalSeconds - timeLeft) / totalSeconds) * 100;
    }
  };

  return (
    <TimerCard title={isBreak ? "休息時間" : "專注時間"}>
      <Progress
        type="circle"
        percent={calculateProgress()}
        format={() => formatTime(timeLeft)}
        size={200}
        status={isBreak ? "success" : "active"}
      />

      <ControlsContainer>
        <Button
          type="primary"
          icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={toggleTimer}
        >
          {isRunning ? '暫停' : '開始'}
        </Button>
        <Button icon={<RedoOutlined />} onClick={resetTimer}>
          重置
        </Button>
      </ControlsContainer>

      <SettingsContainer>
        <SettingRow>
          <span>專注模式</span>
          <Switch
            checked={focusMode}
            onChange={setFocusMode}
          />
        </SettingRow>

        <SettingRow>
          <span>背景音樂</span>
          <Switch
            checked={backgroundMusic}
            onChange={setBackgroundMusic}
          />
        </SettingRow>

        <SettingRow>
          <span>計時方式</span>
          <Select
            value={countDirection}
            onChange={setCountDirection}
            style={{ width: 120 }}
          >
            <Option value="up">正計時</Option>
            <Option value="down">倒計時</Option>
          </Select>
        </SettingRow>

        <SettingRow>
          <span>工作時長（分鐘）</span>
          <InputNumber
            min={1}
            max={60}
            value={workDuration}
            onChange={(value) => setWorkDuration(value || 25)}
          />
        </SettingRow>

        <SettingRow>
          <span>休息時長（分鐘）</span>
          <InputNumber
            min={1}
            max={30}
            value={breakDuration}
            onChange={(value) => setBreakDuration(value || 5)}
          />
        </SettingRow>
      </SettingsContainer>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        今日專注時長：{Math.floor(dailyFocusTime / 60)}小時{dailyFocusTime % 60}分鐘
      </div>
    </TimerCard>
  );
};

export default PomodoroTimer;
