import React, { useState, useEffect } from 'react';
import { Layout, message, Tabs, Button, Dropdown, Menu, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import QuadrantView from './components/QuadrantView';
import TaskFilter from './components/TaskFilter';
import PomodoroTimer from './components/PomodoroTimer';
import Calendar from './components/Calendar';
import Notes from './components/Notes';
import Schedule from './components/Schedule';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import Auth from './components/Auth';
import styled from 'styled-components';
import { requestNotificationPermission } from './services/reminderService';
import syncService from './services/syncService';
import pomodoroService from './services/pomodoroService';
import authService from './services/authService';
import type { User } from './types/user';

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const StyledHeader = styled(Header)`
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const StyledContent = styled(Content)`
  padding: 24px;
  height: calc(100vh - 64px);
  overflow-y: auto;
`;

const App: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    timeRange: 'all',
    repeatType: 'all'
  });
  const [activeTab, setActiveTab] = useState('1');
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // 檢查用戶登錄狀態
      const currentUser = authService.getUser();
      if (currentUser) {
        setUser(currentUser);
      }

      // 請求通知權限
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        message.success('已啟用通知功能');
      }

      // 初始化數據同步
      try {
        await syncService.syncData();
      } catch (error) {
        message.error('數據同步失敗');
      }
    };

    initializeApp();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleFocusStart = () => {
    pomodoroService.enableFocusMode();
    message.success('已進入專注模式');
  };

  const handleFocusEnd = () => {
    pomodoroService.disableFocusMode();
    message.success('專注模式已結束');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      message.success('已登出');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => setShowAuth(true)}
      >
        個人資料
      </Menu.Item>
      <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        onClick={() => setActiveTab('7')}
      >
        設置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
      >
        登出
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <StyledHeader>
        <HeaderLeft>
          <h1>肥牛待辦事項</h1>
        </HeaderLeft>
        <HeaderRight>
          {user ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar
                src={user.avatar}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => setShowAuth(true)}>
              登錄
            </Button>
          )}
        </HeaderRight>
      </StyledHeader>
      <StyledContent>
        {showAuth ? (
          <Auth
            user={user}
            onAuthSuccess={(newUser) => {
              setUser(newUser);
              setShowAuth(false);
            }}
            onLogout={handleLogout}
          />
        ) : (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="任務清單" key="1">
              <TaskFilter
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                filters={filters}
              />
              <QuadrantView
                searchText={searchText}
                filters={filters}
              />
            </TabPane>
            <TabPane tab="番茄鐘" key="2">
              <PomodoroTimer
                onFocusStart={handleFocusStart}
                onFocusEnd={handleFocusEnd}
              />
            </TabPane>
            <TabPane tab="日曆" key="3">
              <Calendar />
            </TabPane>
            <TabPane tab="筆記" key="4">
              <Notes />
            </TabPane>
            <TabPane tab="日程表" key="5">
              <Schedule />
            </TabPane>
            <TabPane tab="統計" key="6">
              <Statistics />
            </TabPane>
            <TabPane tab="設置" key="7">
              <Settings />
            </TabPane>
          </Tabs>
        )}
      </StyledContent>
    </Layout>
  );
};

export default App;
