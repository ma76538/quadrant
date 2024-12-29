import React, { useState } from 'react';
import { Form, Input, Button, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import authService from '../../services/authService';
import type { LoginCredentials } from '../../types/user';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
`;

interface LoginProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

const Login: React.FC<LoginProps> = ({
  onSuccess,
  onRegisterClick,
  onForgotPasswordClick
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginCredentials) => {
    setLoading(true);
    try {
      await authService.login(values);
      message.success('登錄成功');
      onSuccess();
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Title>登錄</Title>
      <Form
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '請輸入郵箱' },
            { type: 'email', message: '請輸入有效的郵箱地址' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="郵箱"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '請輸入密碼' },
            { min: 6, message: '密碼至少6個字符' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密碼"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            登錄
          </Button>
        </Form.Item>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button type="link" onClick={onRegisterClick}>
            註冊新帳號
          </Button>
          <Button type="link" onClick={onForgotPasswordClick}>
            忘記密碼？
          </Button>
        </Space>
      </Form>
    </LoginContainer>
  );
};

export default Login;
