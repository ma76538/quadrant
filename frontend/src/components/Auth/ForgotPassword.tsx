import React, { useState } from 'react';
import { Form, Input, Button, message, Steps } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import authService from '../../services/authService';
import type { ResetPasswordData } from '../../types/user';

const { Step } = Steps;

const ForgotPasswordContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
`;

const StyledSteps = styled(Steps)`
  margin-bottom: 24px;
`;

interface ForgotPasswordProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onSuccess,
  onLoginClick
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [form] = Form.useForm();

  const handleRequestReset = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authService.requestPasswordReset(values.email);
      setEmail(values.email);
      message.success('重置密碼郵件已發送，請檢查您的郵箱');
      setCurrentStep(1);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordData) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        ...values,
        email
      });
      message.success('密碼重置成功');
      onSuccess();
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            name="requestReset"
            onFinish={handleRequestReset}
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
                prefix={<MailOutlined />}
                placeholder="郵箱"
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
                發送重置郵件
              </Button>
            </Form.Item>
          </Form>
        );

      case 1:
        return (
          <Form
            form={form}
            name="resetPassword"
            onFinish={handleResetPassword}
            layout="vertical"
          >
            <Form.Item
              name="code"
              rules={[
                { required: true, message: '請輸入驗證碼' },
                { len: 6, message: '驗證碼應為6位' }
              ]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="驗證碼"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: '請輸入新密碼' },
                { min: 6, message: '密碼至少6個字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="新密碼"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: '請確認密碼' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
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
                重置密碼
              </Button>
            </Form.Item>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <ForgotPasswordContainer>
      <Title>重置密碼</Title>
      <StyledSteps current={currentStep}>
        <Step title="驗證郵箱" />
        <Step title="重置密碼" />
      </StyledSteps>

      {renderStep()}

      <Button type="link" block onClick={onLoginClick}>
        返回登錄
      </Button>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
