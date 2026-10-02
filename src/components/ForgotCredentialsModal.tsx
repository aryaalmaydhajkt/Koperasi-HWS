import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  User, 
  Mail, 
  Smartphone, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Search,
  Sparkles,
  Send
} from 'lucide-react';
import { appStore, cleanNik, cleanPhoneNumber } from '../data/store';
import { MemberUser, AdminUser } from '../types';
import { HwsLogo } from './HwsLogo';

interface ForgotCredentialsModalProps {
  portalMode: 'ANGGOTA' | 'ADMIN';
  initialTab?: 'LUPA_ID' | 'LUPA_PASSWORD';
  onClose: () => void;
  onApplyIdentifier?: (id: string) => void;
}

export const ForgotCredentialsModal: React.FC<ForgotCredentialsModalProps> = ({
  portalMode,
  initialTab = 'LUPA_PASSWORD',
  onClose,
  onApplyIdentifier,
}) => {
  const [activeTab, setActiveTab] = useState<'LUPA_ID' | 'LUPA_PASSWORD'>(initialTab);
  
  // State for LUPA ID
  const [searchIdInput, setSearchIdInput] = useState('');
  const [foundMember, setFoundMember] = useState<MemberUser | null>(null);
  const [foundAdmin, setFoundAdmin] = useState<AdminUser | null>(null);
  const [searchIdError, setSearchIdError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // State for LUPA PASSWORD
  const [pwStep, setPwStep] = useState<1 | 2 | 3>(1); // 1: identify, 2: verify (question or email), 3: new password
  const [targetAccount, setTargetAccount] = useState<{ type: 'MEMBER' | 'ADMIN'; data: MemberUser | AdminUser } | null>(null);
  const [pwIdentifier, setPwIdentifier] = useState('');
  const [pwMethod, setPwMethod] = useState<'QUESTION' | 'EMAIL'>('QUESTION');
  
  // Verification details
  const [selectedQuestion, setSelectedQuestion] = useState('Apa nama ibu kandung Anda?');
  const [inputAnswer, setInputAnswer] = useState('');
  const [otpGenerated, setOtpGenerated] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSentNotification, setOtpSentNotification] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState('');

  // New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Handlers for LUPA ID
  const handleSearchId = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchIdError('');
    setFoundMember(null);
    setFoundAdmin(null);

    const query = searchIdInput.trim();
    if (!query) {
      setSearchIdError('Harap masukkan NIK, Nomor HP, atau Email Anda.');
      return;
    }

    if (portalMode === 'ANGGOTA') {
      const member = appStore.findMemberForRecovery(query);
      if (member) {
        setFoundMember(member);
      } else {
        setSearchIdError('Data anggota tidak ditemukan. Pastikan NIK, Nomor HP, atau Email sudah benar.');
      }
    } else {
      const admin = appStore.findAdminForRecovery(query);
      if (admin) {
        setFoundAdmin(admin);
      } else {
        setSearchIdError('Data pengurus/admin tidak ditemukan. Pastikan Email, No. HP, atau NIK terdaftar.');
      }
    }
  };

  const handleCopyAndUseId = (idString: string) => {
    navigator.clipboard.writeText(idString);
    setCopiedId(true);
    if (onApplyIdentifier) {
      onApplyIdentifier(idString);
    }
    setTimeout(() => {
      setCopiedId(false);
      onClose();
    }, 1200);
  };

  // Handlers for LUPA PASSWORD: Step 1 (Find Account)
  const handleFindAccountForPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    const query = pwIdentifier.trim();
    if (!query) {
      setVerifyError('Harap masukkan ID, Username, No. HP, atau Email terdaftar.');
      return;
    }

    if (portalMode === 'ANGGOTA') {
      const mem = appStore.findMemberForRecovery(query);
      if (mem) {
        setTargetAccount({ type: 'MEMBER', data: mem });
        if (mem.securityQuestion) {
          setSelectedQuestion(mem.securityQuestion);
        }
        setPwStep(2);
      } else {
        setVerifyError('Akun anggota tidak ditemukan. Periksa kembali input Anda.');
      }
    } else {
      const adm = appStore.findAdminForRecovery(query);
      if (adm) {
        setTargetAccount({ type: 'ADMIN', data: adm });
        if (adm.securityQuestion) {
          setSelectedQuestion(adm.securityQuestion);
        }
        setPwStep(2);
      } else {
        setVerifyError('Akun admin tidak ditemukan. Periksa kembali input Anda.');
      }
    }
  };

  // Step 2: Send Email OTP Simulation
  const handleSendEmailOtp = () => {
    if (!targetAccount) return;
    const email = targetAccount.data.email || (targetAccount.type === 'ADMIN' ? 'admin@hws.koperasi.id' : 'anggota@gmail.com');
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpGenerated(randomOtp);
    setOtpSentNotification(`Kode verifikasi 6-digit berhasil dikirim ke ${email}. (Kode OTP Anda: ${randomOtp})`);
  };

  // Step 2: Verify Question or Email
  const handleVerifyStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (!targetAccount) return;

    if (pwMethod === 'QUESTION') {
      const correctAns = (targetAccount.data.securityAnswer || 'Siti').toLowerCase().trim();
      const userAns = inputAnswer.toLowerCase().trim();

      // Check if matches custom answer or default fallbacks
      const isMatch = 
        correctAns === userAns || 
        userAns === 'siti' || 
        userAns === 'jakarta barat' || 
        userAns.includes('jakarta') ||
        (targetAccount.data.kota && userAns === targetAccount.data.kota.toLowerCase().trim());

      if (isMatch) {
        setPwStep(3);
      } else {
        setVerifyError('Jawaban pertanyaan keamanan belum tepat. Silakan coba kembali atau gunakan metode Email.');
      }
    } else {
      // Email OTP verification
      if (!otpGenerated) {
        setVerifyError('Harap klik "Kirim Kode OTP" terlebih dahulu.');
        return;
      }
      if (otpInput.trim() !== otpGenerated) {
        setVerifyError('Kode verifikasi (OTP) salah. Periksa kembali kode 6 digit yang dikirim.');
        return;
      }
      setPwStep(3);
    }
  };

  // Step 3: Save New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (newPassword.length < 3) {
      setVerifyError('Password baru minimal 3 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setVerifyError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      if (targetAccount?.type === 'MEMBER') {
        appStore.resetMemberPassword(targetAccount.data.id, newPassword);
      } else if (targetAccount?.type === 'ADMIN') {
        appStore.resetAdminPassword(targetAccount.data.id, newPassword);
      }

      setResetSuccess(true);
      setTimeout(() => {
        if (onApplyIdentifier && targetAccount) {
          const id = targetAccount.type === 'MEMBER' 
            ? (targetAccount.data as MemberUser).noAnggota 
            : (targetAccount.data as AdminUser).username;
          onApplyIdentifier(id);
        }
        onClose();
      }, 1800);
    } catch (err: any) {
      setVerifyError(err.message || 'Gagal mereset password.');
    }
  };

  const maskEmail = (email?: string) => {
    if (!email) return 'e***@koperasi.id';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const domain = parts[1];
    const masked = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
    return `${masked}@${domain}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Bantuan Akun {portalMode === 'ANGGOTA' ? 'Anggota' : 'Pengurus / Admin'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Layanan Pemulihan ID Login & Reset Password Resmi Koperasi HWS
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LUPA_ID');
              setSearchIdError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'LUPA_ID'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Lupa ID / Nomor Anggota</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('LUPA_PASSWORD');
              setVerifyError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'LUPA_PASSWORD'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Lupa Password</span>
          </button>
        </div>

        {/* Tab 1: LUPA ID */}
        {activeTab === 'LUPA_ID' && (
          <div className="p-5 space-y-4 overflow-y-auto text-xs">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-slate-300 text-[11px] leading-relaxed">
              💡 Masukkan salah satu data yang terdaftar (<strong>Nomor HP</strong>, <strong>NIK KTP</strong>, atau <strong>Email</strong>) untuk menemukan ID {portalMode === 'ANGGOTA' ? 'Nomor Anggota' : 'Username Admin'} Anda.
            </div>

            <form onSubmit={handleSearchId} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Masukkan No. HP / NIK / Email Terdaftar
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0812... atau 31730... atau email@..."
                    value={searchIdInput}
                    onChange={(e) => setSearchIdInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {searchIdError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchIdError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Search className="w-4 h-4" /> Cari ID Akun Saya
              </button>
            </form>

            {/* Found Member Result Card */}
            {foundMember && (
              <div className="mt-4 p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Akun Anggota Ditemukan!
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Nama Lengkap:</span>
                    <span className="font-bold text-white">{foundMember.nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Nomor Anggota (ID):</span>
                    <span className="text-amber-400 font-bold text-xs">{foundMember.noAnggota}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">No. Rekening Koperasi:</span>
                    <span className="text-cyan-400">{foundMember.noRekKoperasi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Wilayah DKI Jakarta:</span>
                    <span className="text-slate-300">{foundMember.wilayah}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAndUseId(foundMember.noAnggota)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId ? 'Tersalin! Membuka Login...' : 'Salin Nomor Anggota & Masuk'}</span>
                </button>
              </div>
            )}

            {/* Found Admin Result Card */}
            {foundAdmin && (
              <div className="mt-4 p-4 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Akun Pengurus / Admin Ditemukan!
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Nama:</span>
                    <span className="font-bold text-white">{foundAdmin.nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Username Admin (ID):</span>
                    <span className="text-amber-400 font-bold text-xs">{foundAdmin.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Jabatan:</span>
                    <span className="text-cyan-400">{foundAdmin.roleTitle}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAndUseId(foundAdmin.username)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {copiedId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId ? 'Tersalin! Membuka Login...' : 'Salin Username & Masuk'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: LUPA PASSWORD */}
        {activeTab === 'LUPA_PASSWORD' && (
          <div className="p-5 space-y-4 overflow-y-auto text-xs">
            
            {/* Step 1: Cari Akun */}
            {pwStep === 1 && (
              <form onSubmit={handleFindAccountForPassword} className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-slate-300 text-[11px] leading-relaxed">
                  Langkah 1: Masukkan <strong>Nomor Anggota</strong>, <strong>No. HP</strong>, atau <strong>Email</strong> akun {portalMode === 'ANGGOTA' ? 'anggota' : 'admin'} Anda yang ingin direset password-nya.
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {portalMode === 'ANGGOTA' ? 'Nomor Anggota / No. HP / Email' : 'Username / Email / No. HP Admin'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder={portalMode === 'ANGGOTA' ? 'Contoh: HWS-CKR-2026-001 atau 0812...' : 'superadmin'}
                      value={pwIdentifier}
                      onChange={(e) => setPwIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {verifyError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Lanjutkan ke Pemulihan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Step 2: Pilih Metode Pemulihan: Pertanyaan Keamanan ATAU Email */}
            {pwStep === 2 && targetAccount && (
              <form onSubmit={handleVerifyStep2} className="space-y-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Akun yang Dipulihkan:</div>
                    <div className="text-white font-bold text-xs">{targetAccount.data.nama}</div>
                    <div className="text-amber-400 text-[10px] font-mono">
                      {targetAccount.type === 'MEMBER' 
                        ? (targetAccount.data as MemberUser).noAnggota 
                        : (targetAccount.data as AdminUser).username}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPwStep(1)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Ganti Akun
                  </button>
                </div>

                {/* Method Selector */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPwMethod('QUESTION');
                      setVerifyError('');
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      pwMethod === 'QUESTION'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Pertanyaan Keamanan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPwMethod('EMAIL');
                      setVerifyError('');
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      pwMethod === 'EMAIL'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Lewat Email Terdaftar</span>
                  </button>
                </div>

                {/* Option 1: Pertanyaan Keamanan */}
                {pwMethod === 'QUESTION' && (
                  <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Pertanyaan Keamanan
                      </label>
                      <select
                        value={selectedQuestion}
                        onChange={(e) => setSelectedQuestion(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                      >
                        <option value="Apa nama ibu kandung Anda?">Apa nama ibu kandung Anda?</option>
                        <option value="Di kota mana Anda dilahirkan?">Di kota mana Anda dilahirkan?</option>
                        <option value="Apa nama sekolah dasar pertama Anda?">Apa nama sekolah dasar pertama Anda?</option>
                        <option value="Apa makanan atau hobi favorit Anda?">Apa makanan atau hobi favorit Anda?</option>
                        <option value="Di kota mana kantor pusat Koperasi HWS berada?">Di kota mana kantor pusat Koperasi HWS berada?</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Jawaban Anda *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ketik jawaban rahasia Anda"
                        value={inputAnswer}
                        onChange={(e) => setInputAnswer(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Tips: Contoh jawaban standar yang diterima meliputi nama ibu (contoh: Siti) atau kota domisili Jakarta Barat.
                      </p>
                    </div>
                  </div>
                )}

                {/* Option 2: Lewat Email Terdaftar */}
                {pwMethod === 'EMAIL' && (
                  <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-400">Email Tujuan Reset:</div>
                        <div className="font-mono text-white font-bold">
                          {maskEmail(targetAccount.data.email)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Kirim Kode OTP
                      </button>
                    </div>

                    {otpSentNotification && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Notifikasi Simulasi Email Masuk
                        </div>
                        <div>{otpSentNotification}</div>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Masukkan 6-Digit Kode Verifikasi (OTP) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="Contoh: 123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {verifyError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPwStep(1)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:text-white transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <span>Verifikasi & Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Atur Password Baru */}
            {pwStep === 3 && targetAccount && (
              <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>Verifikasi identitas berhasil! Silakan buat password baru Anda.</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Password Baru *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Ketik password baru Anda"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Konfirmasi Password Baru *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ketik ulang password baru Anda"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {verifyError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{verifyError}</span>
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-emerald-600 text-white font-bold rounded-xl text-center animate-in zoom-in-95">
                    🎉 Password berhasil diubah! Membuka halaman login...
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetSuccess}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" /> Simpan Password Baru
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
