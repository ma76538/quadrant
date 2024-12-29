import React, { useState, useEffect } from 'react';
import { Card, Form, Switch, Select, TimePicker, Upload, Button, message, Divider } from 'antd';
import { UploadOutlined, GlobalOutlined, BellOutlined, PictureOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { Option } = Select;

interface SettingsState {
  theme: 'light' | 'dark';
  language: string;
  wakeupTime: string;
  notificationSound: string;
  desktopWidget: boolean;
  autoSync: boolean;
}

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'light',
    language: 'zh-TW',
    wakeupTime: '07:00',
    notificationSound: 'default',
    desktopWidget: true,
    autoSync: true
  });

  const [form] = Form.useForm();

  useEffect(() => {
    // 從 localStorage 加載設置
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      form.setFieldsValue(parsedSettings);
    }
  }, [form]);

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    message.success('設置已更新');
  };

  const soundOptions = [
    { label: '默認提示音', value: 'default' },
    { label: '溫柔提醒', value: 'gentle' },
    { label: '清脆鈴聲', value: 'bell' },
    { label: '輕音樂', value: 'music' }
  ];

  const languageOptions = [
    { label: '繁體中文', value: 'zh-TW' },
    { label: '简体中文', value: 'zh-CN' },
    { label: 'English', value: 'en' },
    { label: '日本語', value: 'ja' }
  ];

  const handleCustomSoundUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上傳成功`);
      handleSettingChange('notificationSound', 'custom');
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上傳失敗`);
    }
  };

  return (
    <div>
      <StyledCard title="主題設置">
        <Form form={form} layout="vertical">
          <SettingRow>
            <span>深色模式</span>
            <Switch
              checked={settings.theme === 'dark'}
              onChange={(checked) => handleSettingChange('theme', checked ? 'dark' : 'light')}
            />
          </SettingRow>

          <SettingRow>
            <span>界面語言</span>
            <Select
              value={settings.language}
              onChange={(value) => handleSettingChange('language', value)}
              style={{ width: 200 }}
            >
              {languageOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </SettingRow>
        </Form>
      </StyledCard>

      <StyledCard title="通知設置">
        <Form form={form} layout="vertical">
          <SettingRow>
            <span>早起提醒時間</span>
            <TimePicker
              value={dayjs(settings.wakeupTime, 'HH:mm')}
              format="HH:mm"
              onChange={(time) => handleSettingChange('wakeupTime', time?.format('HH:mm'))}
            />
          </SettingRow>

          <SettingRow>
            <span>提醒音效</span>
            <Select
              value={settings.notificationSound}
              onChange={(value) => handleSettingChange('notificationSound', value)}
              style={{ width: 200 }}
            >
              {soundOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </SettingRow>

          <SettingRow>
            <span>自定義提醒音</span>
            <Upload
              accept="audio/*"
              showUploadList={false}
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
              onChange={handleCustomSoundUpload}
            >
              <Button icon={<UploadOutlined />}>上傳音效</Button>
            </Upload>
          </SettingRow>
        </Form>
      </StyledCard>

      <StyledCard title="桌面小組件">
        <Form form={form} layout="vertical">
          <SettingRow>
            <span>啟用桌面小組件</span>
            <Switch
              checked={settings.desktopWidget}
              onChange={(checked) => handleSettingChange('desktopWidget', checked)}
            />
          </SettingRow>

          <SettingRow>
            <span>自動同步數據</span>
            <Switch
              checked={settings.autoSync}
              onChange={(checked) => handleSettingChange('autoSync', checked)}
            />
          </SettingRow>
        </Form>
      </StyledCard>

      <StyledCard title="關於">
        <p>版本：1.0.0</p>
        <p>開發者：Codeium</p>
        <Button type="link" href="/privacy">隱私政策</Button>
        <Button type="link" href="/terms">用戶協議</Button>
      </StyledCard>
    </div>
  );
};

export default SettingsComponent;
