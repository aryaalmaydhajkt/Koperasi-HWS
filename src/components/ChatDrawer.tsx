import React, { useState } from 'react';
import { ChatMessage, MemberUser, AdminUser } from '../types';
import { appStore } from '../data/store';
import { X, Send, Download, MessageSquare, Clock, User, Shield } from 'lucide-react';

interface ChatDrawerProps {
  currentMember?: MemberUser;
  currentAdmin?: AdminUser;
  targetMemberId?: string; // If admin is viewing a member's chat
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  currentMember,
  currentAdmin,
  targetMemberId,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const state = appStore.getState();

  // Determine active conversation member
  const memberId = currentMember ? currentMember.id : targetMemberId || (state.members[0]?.id ?? '');
  const activeMember = state.members.find((m) => m.id === memberId) || currentMember;

  // Filter messages for this member (retained max 20 days per point 14)
  const twentyDaysAgo = Date.now() - 20 * 24 * 60 * 60 * 1000;
  const memberChats = state.chats
    .filter((c) => c.memberId === memberId && new Date(c.timestamp).getTime() >= twentyDaysAgo)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeMember) return;

    if (currentMember) {
      appStore.sendChatMessage({
        memberId: currentMember.id,
        memberName: currentMember.nama,
        sender: 'MEMBER',
        text: inputText,
      });
    } else if (currentAdmin) {
      appStore.sendChatMessage({
        memberId: activeMember.id,
        memberName: activeMember.nama,
        sender: 'ADMIN',
        adminName: currentAdmin.nama,
        text: inputText,
      });
    }

    setInputText('');
  };

  const handleDownloadChat = () => {
    if (!activeMember) return;
    const lines = [
      `=== RIWAYAT CHAT KOPERASI HWS ===`,
      `Anggota: ${activeMember.nama} (${activeMember.noAnggota})`,
      `Wilayah: ${activeMember.wilayah}`,
      `Tanggal Unduh: ${new Date().toLocaleString('id-ID')}`,
      `Masa Simpan: Maksimal 20 Hari Terakhir`,
      `--------------------------------------------------`,
      ...memberChats.map((c) => {
        const time = new Date(c.timestamp).toLocaleString('id-ID');
        const sender = c.sender === 'MEMBER' ? activeMember.nama : `Admin (${c.adminName || 'Pengurus'})`;
        return `[${time}] ${sender}: ${c.text}`;
      }),
      `--------------------------------------------------`,
      `Total Pesan: ${memberChats.length}`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chat_HWS_${activeMember.nama.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {currentMember ? 'Layanan Bantuan Pengurus Koperasi' : `Chat dengan: ${activeMember?.nama || 'Anggota'}`}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Riwayat tersimpan 20 hari
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadChat}
              title="Download Riwayat Chat (Point 14)"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Member Selector (If admin has multiple members) */}
        {currentAdmin && state.members.length > 1 && (
          <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/60 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Pilih Anggota:</span>
            <select
              value={activeMember?.id}
              onChange={(e) => {
                // Changing target
              }}
              className="bg-slate-800 text-xs text-white rounded px-2 py-1 border border-slate-700 outline-none flex-1"
            >
              {state.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} - {m.wilayah} ({m.noAnggota})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {memberChats.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>Belum ada percakapan.</p>
              <p className="text-[10px] text-slate-600 mt-1">
                Kirim pesan untuk berkomunikasi langsung dengan {currentMember ? 'admin koperasi' : 'anggota'}.
              </p>
            </div>
          ) : (
            memberChats.map((c) => {
              const isMe = currentMember ? c.sender === 'MEMBER' : c.sender === 'ADMIN';
              return (
                <div
                  key={c.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                    {c.sender === 'ADMIN' ? (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Shield className="w-3 h-3" /> {c.adminName || 'Admin'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3" /> {c.memberName}
                      </span>
                    )}
                    <span>•</span>
                    <span className="font-mono">
                      {new Date(c.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-xs'
                    }`}
                  >
                    {c.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Tulis pesan ke admin..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
