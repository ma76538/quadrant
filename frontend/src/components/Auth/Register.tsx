import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import authService from '../../services/authService';
import type { RegisterData } from '../../types/user';

const RegisterContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
`;

interface RegisterProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onSuccess,
  onLoginClick
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: RegisterData) => {
    console.log('註冊表單數據：', values);  // 添加日誌

    if (values.password !== values.confirmPassword) {
      message.error('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        email: values.email,
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword
      });
      console.log('註冊響應：', response);  // 添加日誌
      message.success('註冊成功');
      onSuccess();
    } catch (error: any) {
      console.error('註冊錯誤：', error);  // 添加日誌
      const errorMessage = error.response?.data?.detail || error.message || '註冊失敗，請稍後重試';
      message.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <Title>註冊新帳號</Title>
      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        validateTrigger="onBlur"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '請輸入用戶名' },
            { min: 2, message: '用戶名至少2個字符' },
            { max: 20, message: '用戶名最多20個字符' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: '用戶名只能包含字母、數字和下劃線' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用戶名"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: '請輸入郵箱' },
            { type: 'email', message: '請輸入有效的郵箱地址' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="郵箱"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '請輸入密碼' },
            { min: 6, message: '密碼至少6個字符' },
            { max: 20, message: '密碼最多20個字符' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密碼"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '請確認密碼' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('兩次輸入的密碼不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="確認密碼"
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
            註冊
          </Button>
        </Form.Item>

        <Button type="link" block onClick={onLoginClick}>
          已有帳號？返回登錄
        </Button>
      </Form>
    </RegisterContainer>
  );
};

export default Register;
