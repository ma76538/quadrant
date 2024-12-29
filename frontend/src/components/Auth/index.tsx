import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import Profile from './Profile';
import type { User } from '../../types/user';

type AuthView = 'login' | 'register' | 'forgotPassword' | 'profile';

interface AuthProps {
  user: User | null;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
}

const Auth: React.FC<AuthProps> = ({
  user,
  onAuthSuccess,
  onLogout
}) => {
  const [view, setView] = useState<AuthView>(user ? 'profile' : 'login');

  const handleAuthSuccess = (user: User) => {
    onAuthSuccess(user);
    setView('profile');
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return (
          <Login
            onSuccess={handleAuthSuccess}
            onRegisterClick={() => setView('register')}
            onForgotPasswordClick={() => setView('forgotPassword')}
          />
        );

      case 'register':
        return (
          <Register
            onSuccess={handleAuthSuccess}
            onLoginClick={() => setView('login')}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPassword
            onSuccess={() => setView('login')}
            onLoginClick={() => setView('login')}
          />
        );

      case 'profile':
        return user ? (
          <Profile
            user={user}
            onUpdate={onAuthSuccess}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div>
      {renderView()}
    </div>
  );
};

export default Auth;
