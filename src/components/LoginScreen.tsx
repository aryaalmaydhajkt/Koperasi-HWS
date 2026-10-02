import React, { useState } from 'react';
import { HwsLogo } from './HwsLogo';
import { appStore } from '../data/store';
import { MemberUser, AdminUser } from '../types';
import { Smartphone, Shield, User, Lock, ArrowRight, UserPlus, AlertCircle, KeyRound, HelpCircle } from 'lucide-react';
import { RegisterModal } from './RegisterModal';
import { PWAInstallButton } from './PWAInstallButton';
import { ForgotCredentialsModal } from './ForgotCredentialsModal';

interface LoginScreenProps {
  onMemberLogin: (member: MemberUser) => void;
  onAdminLogin: (admin: AdminUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onMemberLogin, onAdminLogin }) => {
  const [portalMode, setPortalMode] = useState<'ANGGOTA' | 'ADMIN'>('ANGGOTA');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotModalTab, setForgotModalTab] = useState<'LUPA_ID' | 'LUPA_PASSWORD'>('LUPA_PASSWORD');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan identitas dan password Anda.');
      return;
    }

    if (portalMode === 'ANGGOTA') {
      const member = appStore.loginMember(identifier, password);
      if (member) {
        onMemberLogin(member);
      } else {
        setErrorMsg('Nomor Anggota, No. HP, atau Password salah. Jika belum terdaftar, silakan klik Daftar Anggota Baru.');
      }
    } else {
      const admin = appStore.loginAdmin(identifier, password);
      if (admin) {
        onAdminLogin(admin);
      } else {
        setErrorMsg('Username atau Password admin salah. Pastikan Anda memiliki hak akses pengurus koperasi.');
      }
    }
  };



  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-white font-sans relative">
      {/* Top Right Quick App Install Action */}
      <div className="absolute top-4 right-4 z-20">
        <PWAInstallButton variant="header" />
      </div>
      
      {/* Brand Header (Matches Tampilan Login.png) */}
      <div className="flex flex-col items-center text-center mb-6 max-w-md">
        
        {/* Rounded square white box with Logo inside (Matches Tampilan Login.png) */}
        <div className="w-24 h-24 bg-white rounded-3xl p-2.5 shadow-2xl flex items-center justify-center mb-4 border border-white/20">
          <HwsLogo size={76} className="w-20 h-20" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black tracking-wide text-white uppercase leading-tight">
          KOPERASI HWS
        </h1>
        <p className="text-xs text-slate-300 font-medium mt-1">
          Koperasi Himpunan Wirausaha Sejahtera
        </p>
        <p className="text-xs text-amber-400 font-bold mt-0.5 tracking-wide">
          Cengkareng • Kalideres • Kembangan • Kebon Jeruk
        </p>

        {/* Segmented Control Toggle (Matches Tampilan Login.png) */}
        <div className="w-full mt-6 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 grid grid-cols-2 gap-1 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => {
              setPortalMode('ANGGOTA');
              setErrorMsg('');
              setIdentifier('');
              setPassword('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              portalMode === 'ANGGOTA'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Aplikasi Anggota</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode('ADMIN');
              setErrorMsg('');
              setIdentifier('');
              setPassword('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              portalMode === 'ADMIN'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Portal Pengurus / Admin</span>
          </button>
        </div>
      </div>

      {/* Main Login Card (White card matching Tampilan Login.png) */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-100">
        
        {/* Card Title */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {portalMode === 'ANGGOTA'
              ? 'Masuk Aplikasi Anggota (Android & Web)'
              : 'Masuk Portal Pengurus & Admin'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {portalMode === 'ANGGOTA'
              ? 'Gunakan Nomor Anggota / No. HP dan Password terdaftar Anda.'
              : 'Gunakan Akun Pengurus / Super Admin Koperasi HWS.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {portalMode === 'ANGGOTA'
                ? 'Nomor Anggota / No. HP / No. Rekening'
                : 'Username / Email Admin'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder={
                  portalMode === 'ANGGOTA'
                    ? 'Contoh: HWS-CKR-2026-001'
                    : 'superadmin'
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              </div>
            </div>

            {/* Lupa ID & Lupa Password Links */}
            <div className="flex items-center justify-between text-[11px] pt-1 px-0.5">
              <button
                type="button"
                onClick={() => {
                  setForgotModalTab('LUPA_ID');
                  setShowForgotModal(true);
                }}
                className="text-amber-700 hover:text-amber-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <User className="w-3 h-3 text-amber-600" />
                <span>{portalMode === 'ANGGOTA' ? 'Lupa No. Anggota?' : 'Lupa Username?'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotModalTab('LUPA_PASSWORD');
                  setShowForgotModal(true);
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3 h-3 text-blue-500" />
                <span>Lupa Password?</span>
              </button>
            </div>

            {/* Submit CTA (Orange Button matching Tampilan Login.png) */}
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Register Prompt (For Anggota) */}
            {portalMode === 'ANGGOTA' && (
              <div className="pt-4 text-center space-y-3">
                <p className="text-xs text-slate-500">
                  Belum terdaftar sebagai anggota koperasi?
                </p>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Daftar Anggota Baru (Upload KTP)</span>
                </button>
              </div>
            )}

            {portalMode === 'ADMIN' && (
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  Akses Super Admin: <span className="font-mono text-slate-700 font-bold">superadmin</span> / <span className="font-mono text-slate-700 font-bold">admin</span>
                </p>
              </div>
            )}
          </form>

        </div>

        {/* Registration Modal */}
        {showRegisterModal && (
          <RegisterModal
            onClose={() => setShowRegisterModal(false)}
            onRegistered={(newMember) => {
              setShowRegisterModal(false);
              onMemberLogin(newMember);
            }}
          />
        )}

        {/* Forgot Credentials Modal */}
        {showForgotModal && (
          <ForgotCredentialsModal
            portalMode={portalMode}
            initialTab={forgotModalTab}
            onClose={() => setShowForgotModal(false)}
            onApplyIdentifier={(id) => {
              setIdentifier(id);
            }}
          />
        )}

      {/* PWA Install Banner for Android & Laptop */}
      <PWAInstallButton variant="banner" className="w-full max-w-md mt-6 shadow-xl" />

      {/* Footer copyright */}
      <footer className="mt-8 text-center text-xs text-slate-500">
        © 2026 Koperasi Himpunan Wirausaha Sejahtera (HWS). Seluruh hak cipta dilindungi.
      </footer>

    </div>
  );
};
