import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Avatar, Card, Space } from 'antd';
import { UploadOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { User } from '../../types/user';
import authService from '../../services/authService';

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
`;

const AvatarContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const StyledAvatar = styled(Avatar)`
  width: 100px;
  height: 100px;
`;

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);

  const handleSubmit = async (values: Partial<User>) => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(values);
      onUpdate(updatedUser);
      message.success('個人資料已更新');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      try {
        const url = await authService.uploadAvatar(info.file.originFileObj as File);
        setAvatarUrl(url);
        message.success('頭像上傳成功');
      } catch (error: any) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ProfileContainer>
      <Card title="個人資料">
        <AvatarContainer>
          <Space direction="vertical" size="large">
            <StyledAvatar
              src={avatarUrl}
              icon={<UserOutlined />}
            />
            <Upload
              name="avatar"
              showUploadList={false}
              onChange={handleAvatarUpload}
              accept="image/*"
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
            >
              <Button icon={<UploadOutlined />}>更換頭像</Button>
            </Upload>
          </Space>
        </AvatarContainer>

        <Form
          layout="vertical"
          initialValues={{
            username: user.username,
            email: user.email
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用戶名"
            rules={[
              { required: true, message: '請輸入用戶名' },
              { min: 2, message: '用戶名至少2個字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用戶名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="郵箱"
          >
            <Input
              prefix={<MailOutlined />}
              disabled
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              保存更改
            </Button>
          </Form.Item>
        </Form>

        <Card
          size="small"
          title="會員信息"
          style={{ marginTop: '24px' }}
        >
          <p>會員類型：{user.subscription.type === 'premium' ? 'VIP會員' : '免費用戶'}</p>
          {user.subscription.expiresAt && (
            <p>到期時間：{user.subscription.expiresAt}</p>
          )}
          <p>註冊時間：{user.createdAt}</p>
          <p>上次登錄：{user.lastLoginAt}</p>
        </Card>
      </Card>
    </ProfileContainer>
  );
};

export default Profile;
