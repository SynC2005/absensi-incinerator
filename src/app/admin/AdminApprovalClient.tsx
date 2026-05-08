'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Check,
  Clock3,
  LogOut,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export type ProfileRow = {
  id: string;
  full_name?: string | null;
  role?: string | null;
};

interface AdminApprovalClientProps {
  initialProfiles: ProfileRow[];
  initialError: string | null;
}

const PUBLIC_ROLE = 'umum';
const EMPLOYEE_ROLE = 'pegawai';
const ADMIN_ROLE = 'admin';

const baseFilters = ['all', PUBLIC_ROLE, EMPLOYEE_ROLE, ADMIN_ROLE];

function getString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getProfileId(profile: ProfileRow) {
  return profile.id;
}

function getProfileRole(profile: ProfileRow) {
  return getString(profile.role)?.toLowerCase() ?? PUBLIC_ROLE;
}

function getProfileName(profile: ProfileRow) {
  return getString(profile.full_name) ?? getProfileId(profile).slice(0, 8) ?? 'Pengguna';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    [ADMIN_ROLE]: 'Admin',
    [EMPLOYEE_ROLE]: 'Pegawai',
    [PUBLIC_ROLE]: 'Umum',
  };

  return labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
}

function getRoleStyle(role: string) {
  if (role === EMPLOYEE_ROLE) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (role === ADMIN_ROLE) return 'bg-blue-50 text-blue-700 border-blue-100';
  if (role === PUBLIC_ROLE) return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-slate-50 text-slate-600 border-slate-100';
}

function sortProfiles(profiles: ProfileRow[]) {
  return [...profiles].sort((a, b) => {
    const aRole = getProfileRole(a);
    const bRole = getProfileRole(b);

    if (aRole === PUBLIC_ROLE && bRole !== PUBLIC_ROLE) return -1;
    if (aRole !== PUBLIC_ROLE && bRole === PUBLIC_ROLE) return 1;

    return getProfileName(a).localeCompare(getProfileName(b), 'id-ID');
  });
}

export default function AdminApprovalClient({
  initialProfiles,
  initialError,
}: AdminApprovalClientProps) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRow[]>(() => sortProfiles(initialProfiles));
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState(initialError);

  const stats = useMemo(() => {
    return {
      total: profiles.length,
      umum: profiles.filter((profile) => getProfileRole(profile) === PUBLIC_ROLE).length,
      pegawai: profiles.filter((profile) => getProfileRole(profile) === EMPLOYEE_ROLE).length,
      admin: profiles.filter((profile) => getProfileRole(profile) === ADMIN_ROLE).length,
    };
  }, [profiles]);

  const filters = useMemo(() => {
    const profileRoles = profiles.map(getProfileRole);
    return Array.from(new Set([...baseFilters, ...profileRoles]));
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return profiles.filter((profile) => {
      const role = getProfileRole(profile);
      const matchesFilter = activeFilter === 'all' || role === activeFilter;
      const searchableText = [
        getProfileName(profile),
        getProfileId(profile),
        role,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesFilter && searchableText.includes(normalizedSearch);
    });
  }, [activeFilter, profiles, searchTerm]);

  const pendingInView = useMemo(() => {
    return filteredProfiles.filter((profile) => getProfileRole(profile) === PUBLIC_ROLE).length;
  }, [filteredProfiles]);

  const refreshProfiles = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);

    const { data, error } = await supabase.from('profiles').select('id, full_name, role');

    if (error) {
      setErrorMessage(error.message);
    } else {
      setProfiles(sortProfiles((data ?? []) as ProfileRow[]));
    }

    setIsRefreshing(false);
  };

  const updateRole = async (profileId: string, nextRole: string) => {
    setUpdatingId(profileId);
    setErrorMessage(null);

    const { error } = await supabase.from('profiles').update({ role: nextRole }).eq('id', profileId);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setProfiles((currentProfiles) =>
        sortProfiles(
          currentProfiles.map((profile) =>
            getProfileId(profile) === profileId ? { ...profile, role: nextRole } : profile
          )
        )
      );
    }

    setUpdatingId(null);
  };

  const handleLogout = async () => {
    const isConfirmed = window.confirm('Apakah Anda yakin ingin keluar dari admin panel?');
    if (!isConfirmed) return;

    setIsLoggingOut(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      setIsLoggingOut(false);
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <main className="min-h-dvh bg-[#F0F4F2] pb-[calc(env(safe-area-inset-bottom)+1.25rem)] font-sans text-slate-900">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-[#F0F4F2] sm:max-w-2xl">
      <section className="bg-emerald-800 px-4 pb-20 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-white sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-600/70 bg-emerald-900/40 px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
                Admin Panel
              </span>
            </div>
            <h1 className="text-[1.65rem] font-black leading-[1.05] tracking-tight">
              Approval Akun Pegawai
            </h1>
            <p className="mt-2 max-w-[19rem] text-[13px] font-medium leading-relaxed text-emerald-100/80">
              Akun baru berstatus umum, lalu admin bisa ACC menjadi pegawai.
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-emerald-100 shadow-inner transition-transform active:scale-95 disabled:opacity-60"
            aria-label="Keluar dari admin panel"
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </button>
        </div>
      </section>

      <section className="-mt-12 px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[1.1rem] border border-white/70 bg-white p-3 shadow-[0_18px_34px_-28px_rgba(6,95,70,0.55)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock3 className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black leading-none tracking-tighter text-slate-900">
              {stats.umum}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Umum
            </p>
          </div>

          <div className="rounded-[1.1rem] border border-white/70 bg-white p-3 shadow-[0_18px_34px_-28px_rgba(6,95,70,0.55)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black leading-none tracking-tighter text-slate-900">
              {stats.pegawai}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Pegawai
            </p>
          </div>

          <div className="rounded-[1.1rem] border border-white/70 bg-white p-3 shadow-[0_18px_34px_-28px_rgba(6,95,70,0.55)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <p className="text-2xl font-black leading-none tracking-tighter text-slate-900">
              {stats.total}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Total</span>
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-700">
                {stats.admin}
              </span>
            </div>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <section className="px-4 pt-4 sm:px-6">
          <div className="flex gap-3 rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-black">Gagal membaca profiles</p>
              <p className="mt-1 break-words text-xs font-semibold leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="sticky top-0 z-20 bg-[#F0F4F2]/95 px-4 pt-4 pb-3 backdrop-blur sm:px-6">
        <div className="rounded-[1.1rem] border border-emerald-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama, ID, atau role..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`h-9 shrink-0 rounded-2xl px-4 text-xs font-black transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/10'
                      : 'border border-emerald-100 bg-white text-slate-500'
                  }`}
                >
                  {filter === 'all' ? 'Semua' : getRoleLabel(filter)}
                </button>
              );
            })}
          </div>
          <button
            onClick={refreshProfiles}
            disabled={isRefreshing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-700 shadow-sm transition-transform hover:bg-emerald-50 active:scale-95 disabled:opacity-60"
            aria-label="Muat ulang data profiles"
            title="Muat ulang data"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </button>
        </div>
      </section>

      <section className="px-4 pt-2 sm:px-6">
        <div className="overflow-hidden rounded-[1.1rem] border border-slate-100 bg-white shadow-[0_18px_42px_-32px_rgba(15,23,42,0.42)]">
          <div className="border-b border-slate-100 bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-black tracking-tight text-slate-900">
                  Permintaan Akses
                </h2>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-400">
                  {pendingInView} akun menunggu ACC dalam {filteredProfiles.length} hasil tampil.
                </p>
              </div>
              <div className="shrink-0 rounded-2xl bg-emerald-50 px-3 py-2 text-center">
                <p className="text-lg font-black leading-none text-emerald-800">{pendingInView}</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                  Pending
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[52svh] overflow-y-auto overscroll-contain bg-slate-50/80 sm:max-h-[34rem]">
            {filteredProfiles.length === 0 ? (
              <div className="bg-white p-8 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-black text-slate-700">Belum ada data yang cocok.</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Pastikan tabel profiles berisi akun yang sudah login.
                </p>
              </div>
            ) : (
              <>
                <div className="sticky top-0 z-10 hidden grid-cols-[minmax(0,1fr)_8rem_auto] gap-3 border-b border-slate-100 bg-slate-50/95 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 backdrop-blur sm:grid">
                  <span>Pengguna</span>
                  <span>Role</span>
                  <span className="text-right">Aksi</span>
                </div>
                {filteredProfiles.map((profile) => {
                  const profileId = getProfileId(profile);
                  const role = getProfileRole(profile);
                  const name = getProfileName(profile);
                  const isUpdating = updatingId === profileId;
                  const canApprove = role === PUBLIC_ROLE;

                  return (
                    <article
                      key={profileId}
                      className="border-b border-slate-100 bg-white px-3 py-3 last:border-b-0 sm:px-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xs font-black text-emerald-800 sm:h-11 sm:w-11 sm:text-sm">
                          {getInitials(name)}
                        </div>

                        <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-center sm:gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-black text-slate-900">
                              {name}
                            </h3>
                            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
                              ID: {profileId || 'Tidak ada ID'}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2 sm:mt-0 sm:justify-start">
                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${getRoleStyle(role)}`}
                            >
                              {getRoleLabel(role)}
                            </span>
                            <span className="truncate text-[10px] font-bold text-slate-400 sm:hidden">
                              {role}
                            </span>
                          </div>

                          <div className="mt-3 flex justify-end sm:mt-0">
                            {canApprove ? (
                              <button
                                onClick={() => updateRole(profileId, EMPLOYEE_ROLE)}
                                disabled={isUpdating || !profileId}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 text-xs font-black text-white shadow-lg shadow-emerald-900/10 transition-transform active:scale-95 disabled:opacity-50 sm:w-auto"
                                aria-label={`Setujui akun ${name}`}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                ACC
                              </button>
                            ) : role === EMPLOYEE_ROLE ? (
                              <button
                                onClick={() => updateRole(profileId, PUBLIC_ROLE)}
                                disabled={isUpdating || !profileId}
                                className="h-10 w-full shrink-0 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 transition-transform active:scale-95 disabled:opacity-50 sm:w-auto"
                              >
                                Jadikan Umum
                              </button>
                            ) : role === ADMIN_ROLE ? (
                              <span className="h-10 w-full shrink-0 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-center text-xs font-black leading-none text-blue-700 sm:w-auto">
                                Admin
                              </span>
                            ) : (
                              <button
                                onClick={() => updateRole(profileId, EMPLOYEE_ROLE)}
                                disabled={isUpdating || !profileId}
                                className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 text-xs font-black text-white shadow-lg shadow-emerald-900/10 transition-transform active:scale-95 disabled:opacity-50 sm:w-auto"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                ACC
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
