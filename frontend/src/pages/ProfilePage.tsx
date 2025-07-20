import React from 'react';
import { UserProfile } from '../components/auth/UserProfile';

export const ProfilePage: React.FC = () => {
  return (
    <div className="py-6">
      <UserProfile />
    </div>
  );
};