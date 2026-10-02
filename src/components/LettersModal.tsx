import React, { useState } from 'react';
import { MemberUser, AdminUser, OfficialLetter } from '../types';
import { appStore } from '../data/store';
import { Mail, Send, X, Users, User, ExternalLink, Printer } from 'lucide-react';

interface LettersModalProps {
  currentAdmin: AdminUser;
  members: MemberUser[];
  onClose: () => void;
  onPreviewLetter: (letter: OfficialLetter) => void;
}

export const LettersModal: React.FC<LettersModalProps> = ({
  currentAdmin,
  members,
  onClose,
  onPreviewLetter,
}) => {
  const [target, setTarget] = useState<'SEMUA' | 'INDIVIDUAL'>('SEMUA');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [perihal, setPerihal] = useState('Pemberitahuan Rutin Tabungan & Administrasi Koperasi HWS');
  const [isiSurat, setIsiSurat] = useState(
    'Diberitahukan kepada seluruh anggota Koperasi Himpunan Wirausaha Sejahtera (HWS) untuk senantiasa tertib dalam setoran tabungan kewajiban harian dan pembaruan data keanggotaan resmi demi kelancaran operasional bersama.'
  );

  const [lastSentLetter, setLastSentLetter] = useState<OfficialLetter | null>(null);

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleSendLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perihal.trim() || !isiSurat.trim()) {
      alert('Mohon isi perihal dan isi surat.');
      return;
    }

    const created = appStore.createOfficialLetter({
      nomorSurat: `HWS/SE/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      perihal,
      targetType: target,
      targetMemberId: target === 'INDIVIDUAL' ? selectedMemberId : undefined,
      targetMemberName: target === 'INDIVIDUAL' ? selectedMember?.nama : 'Seluruh Anggota',
      isiSurat,
      senderName: currentAdmin.nama,
    });

    setLastSentLetter(created);
  };

  // WhatsApp and Email link generators
  const getWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/^0/, '62').replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const getEmailLink = (email: string, subject: string, body: string) => {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Surat Menyurat Resmi Koperasi HWS</h3>
              <p className="text-[11px] text-slate-400">
                Kirim surat pemberitahuan ke WhatsApp & Email anggota perorangan atau seluruh anggota (Point F.1)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {lastSentLetter ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-sm">Surat Berhasil Diterbitkan!</span>
                <span className="font-mono text-[10px] text-slate-400">{lastSentLetter.nomorSurat}</span>
              </div>
              
              <p className="text-slate-300">
                Surat resmi telah tercatat dalam sistem dan siap dikirimkan langsung ke nomor WhatsApp dan Email anggota.
              </p>

              {lastSentLetter.targetType === 'INDIVIDUAL' && selectedMember ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={getWhatsAppLink(selectedMember.noHp, `*[Koperasi HWS - Surat Resmi ${lastSentLetter.nomorSurat}]*\n\nPerihal: ${lastSentLetter.perihal}\n\n${lastSentLetter.isiSurat}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka WhatsApp ({selectedMember.nama})
                  </a>

                  <a
                    href={getEmailLink(selectedMember.email || `${selectedMember.noHp}@koperasi-hws.id`, `[Koperasi HWS] ${lastSentLetter.perihal}`, lastSentLetter.isiSurat)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> Kirim Email ({selectedMember.email || selectedMember.nama})
                  </a>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">Surat Ditujukan Ke Seluruh Anggota ({members.length} Orang):</div>
                  <p className="text-slate-400 text-[11px]">
                    Sistem telah mencatat surat edaran ke seluruh akun anggota. Anda juga dapat mencetak / unduh PDF ber-watermark untuk dibagikan secara digital.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onPreviewLetter(lastSentLetter)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" /> Cetak / Unduh PDF Surat Ber-Watermark
                </button>
                <button
                  onClick={() => setLastSentLetter(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
                >
                  Buat Surat Baru
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendLetter} className="space-y-4">
              
              {/* Target Selection */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Target Penerima Surat:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTarget('SEMUA')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                      target === 'SEMUA'
                        ? 'bg-amber-500/10 border-amber-400 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" /> Seluruh Anggota Koperasi ({members.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTarget('INDIVIDUAL')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                      target === 'INDIVIDUAL'
                        ? 'bg-amber-500/10 border-amber-400 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" /> Anggota Tertentu (Perorangan)
                  </button>
                </div>
              </div>

              {/* Individual member dropdown if selected */}
              {target === 'INDIVIDUAL' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Pilih Anggota Penerima:</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-400"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama} - {m.noAnggota} ({m.wilayah}) - {m.noHp}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Perihal */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Perihal Surat:</label>
                <input
                  type="text"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  placeholder="Contoh: Pemberitahuan Penyaluran Qurban & Rapat Tahunan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Isi Surat */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Isi Surat / Pesan:</label>
                <textarea
                  rows={6}
                  value={isiSurat}
                  onChange={(e) => setIsiSurat(e.target.value)}
                  placeholder="Tuliskan pesan atau edaran resmi di sini..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Terbitkan & Kirim Surat Resmi
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
