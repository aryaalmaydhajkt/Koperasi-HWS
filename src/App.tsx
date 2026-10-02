import React, { useState, useEffect } from 'react';
import { appStore } from './data/store';
import { MemberUser, AdminUser } from './types';
import { LoginScreen } from './components/LoginScreen';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [appState, setAppState] = useState(appStore.getState());

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setAppState({ ...appStore.getState() });
    });
    return unsubscribe;
  }, []);

  const activeMember = appState.activeMemberId
    ? appState.members.find((m) => m.id === appState.activeMemberId) || null
    : null;

  const activeAdmin = appState.activeAdminId
    ? appState.admins.find((a) => a.id === appState.activeAdminId) || null
    : null;

  const handleMemberLogin = (member: MemberUser) => {
    // Already set in appStore
  };

  const handleAdminLogin = (admin: AdminUser) => {
    // Already set in appStore
  };

  const handleLogout = () => {
    appStore.logout();
  };

  return (
    <>
      {activeAdmin ? (
        <AdminDashboard
          admin={activeAdmin}
          onLogout={handleLogout}
        />
      ) : activeMember ? (
        <MemberDashboard
          member={activeMember}
          onLogout={handleLogout}
        />
      ) : (
        <LoginScreen
          onMemberLogin={handleMemberLogin}
          onAdminLogin={handleAdminLogin}
        />
      )}

      {/* Global PWA Offline Connectivity Status Banner */}
      <OfflineIndicator />
    </>
  );
}
