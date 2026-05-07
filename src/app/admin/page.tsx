'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Search, 
  ShieldCheck, 
  IdCard, 
  MoreVertical, 
  RefreshCcw, 
  UserPlus, 
  LayoutGrid, 
  Users, 
  Settings,
  Recycle
} from 'lucide-react';

// --- DATA DUMMY ---
const initialUsers = [
  { id: 1, name: 'Arini Saputra', email: 'arini.s@gmail.com', role: 'Public', isActive: true },
  { id: 2, name: 'Budi Darmawan', email: 'budi_d@civicflow.id', role: 'Staff', isActive: false },
  { id: 3, name: 'Citra Lestari', email: 'clestari@gov.id', role: 'Admin', isActive: true },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);

  // Fungsi untuk mengubah peran user
  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-28 flex justify-center">
      <div className="w-full max-w-md bg-[#F8FAFC] relative min-h-screen shadow-sm">
        
        {/* --- HEADER --- */}
        <header className="px-6 pt-10 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="w-6 h-6 text-emerald-700" />
            <h1 className="text-xl font-bold text-emerald-800 tracking-tight">Manajemen Pengguna</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border-2 border-white shadow-sm">
            {/* Ganti src dengan gambar profil admin yang sebenarnya jika ada */}
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} alt="Admin" className="w-full h-full object-cover" />
          </div>
        </header>

        {/* --- SEARCH BAR --- */}
        <div className="px-6 mb-6">
          <div className="bg-slate-100 rounded-2xl flex items-center px-4 py-3.5 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder="Cari nama pengguna atau email..." 
              className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* --- STATISTIC CARDS --- */}
        <div className="px-6 grid grid-cols-2 gap-4 mb-8">
          {/* Card 1: Total Kontribusi (Lebar Penuh) */}
          <div className="col-span-2 bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-1">Total Kontribusi Komunitas</p>
            <div className="flex items-end gap-2 mb-3">
              <h2 className="text-4xl font-black text-emerald-700 leading-none">1,284</h2>
              <span className="text-sm font-medium text-slate-600 mb-1">aktif</span>
            </div>
            
            {/* Avatar Stack */}
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <img 
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
                    className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" 
                    alt="avatar" 
                  />
                ))}
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-400 flex items-center justify-center -ml-3 z-10">
                <span className="text-[10px] font-bold text-white">+12</span>
              </div>
            </div>
          </div>

          {/* Card 2: Admin Aktif */}
          <div className="bg-[#059669] rounded-3xl p-5 shadow-sm text-white">
            <ShieldCheck className="w-6 h-6 mb-8 opacity-80" />
            <p className="text-xs font-medium opacity-90 mb-1">Admin Aktif</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>

          {/* Card 3: Total Pegawai */}
          <div className="bg-[#DCEADF] rounded-3xl p-5 shadow-sm">
            <IdCard className="w-6 h-6 mb-8 text-slate-700" />
            <p className="text-xs font-medium text-slate-600 mb-1">Total Pegawai</p>
            <h3 className="text-2xl font-bold text-slate-800">45</h3>
          </div>
        </div>

        {/* --- DAFTAR PENGGUNA --- */}
        <div className="px-6 mb-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">Daftar Pengguna</h2>
          
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                
                {/* Info User */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[15px] font-medium text-slate-800">{user.name}</h3>
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-600' : 'bg-slate-400'}`}></div>
                    </div>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Segmented Control: Ubah Peran */}
                <div className="mt-2">
                  <p className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mb-2">Ubah Peran</p>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['Staff', 'Public', 'Admin'].map((role) => {
                      const isActive = user.role === role;
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(user.id, role)}
                          className={`flex-1 text-[11px] font-semibold py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-white text-emerald-700 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* --- TOMBOL MUAT LEBIH BANYAK --- */}
        <div className="px-6 flex justify-center mt-6">
          <button className="bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 px-6 rounded-full flex items-center gap-2 transition-colors">
            <RefreshCcw className="w-4 h-4" />
            Muat Lebih Banyak
          </button>
        </div>

        {/* --- FLOATING ACTION BUTTON (FAB) --- */}
        <button className="fixed bottom-24 right-4 sm:right-[calc(50%-200px)] bg-[#047857] hover:bg-emerald-800 text-white p-4 rounded-2xl shadow-xl shadow-emerald-900/20 active:scale-90 transition-transform z-40">
          <UserPlus className="w-6 h-6" />
        </button>

        {/* --- BOTTOM NAVIGATION --- */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#F8FAFC] border-t border-slate-200 pb-safe z-50 flex justify-center">
          <div className="w-full max-w-md bg-[#F8FAFC] flex justify-around items-center h-20 px-4">
            <button className="flex flex-col items-center justify-center w-16 text-slate-400 hover:text-emerald-600 transition-colors">
              <LayoutGrid className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-semibold">Dashboard</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 text-emerald-600">
              <div className="bg-emerald-500 text-white p-1.5 rounded-full mb-1">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold">Users</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 text-slate-400 hover:text-emerald-600 transition-colors">
              <Settings className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-semibold">Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}