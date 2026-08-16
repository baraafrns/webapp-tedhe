import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDynamicDashboardConfig } from './AdminDynamicDashboardConfig';
import { StudentReceiptModal } from '../student/StudentReceiptModal';
import { SchoolLogo } from '../common/SchoolLogo';
import { Student, Teacher, ScheduleItem, SppBill, NewsItem, AttendanceStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Sliders,
  Users,
  Calendar,
  CreditCard,
  Newspaper,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Send,
  Download,
  Filter,
  RefreshCw,
  X,
  Printer,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

type AdminNavTab =
  | 'absensi'
  | 'pengatur_dashboard'
  | 'data_induk'
  | 'jadwal'
  | 'spp'
  | 'berita'
  | 'chat';

export const AdminView: React.FC = () => {
  const {
    students,
    teachers,
    classes,
    schedules,
    attendanceRecords,
    sppBills,
    newsItems,
    chatMessages,
    sendChatMessage,
    addStudent,
    deleteStudent,
    addTeacher,
    deleteTeacher,
    addSchedule,
    deleteSchedule,
    createSppBill,
    paySppBill,
    addNewsItem,
    deleteNewsItem,
    simulateAttendanceScan,
    qrToken,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminNavTab>('absensi');
  const [dataIndukSubTab, setDataIndukSubTab] = useState<'siswa' | 'guru' | 'kelas'>('siswa');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterDay, setFilterDay] = useState<string>('Senin');

  // Active Chat State
  const [activeChatStudentId, setActiveChatStudentId] = useState<string>(students[0]?.id || 'std-001');
  const [adminChatReply, setAdminChatReply] = useState<string>('');

  // Modals State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState<boolean>(false);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState<boolean>(false);
  const [isAddSppModalOpen, setIsAddSppModalOpen] = useState<boolean>(false);
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState<boolean>(false);
  const [isManualAttendanceModalOpen, setIsManualAttendanceModalOpen] = useState<boolean>(false);
  const [viewingReceiptBill, setViewingReceiptBill] = useState<SppBill | null>(null);

  // Form States
  const [newStudentForm, setNewStudentForm] = useState({
    nisn: '',
    name: '',
    classId: classes[0]?.id || 'cls-xi-rpl-1',
    className: classes[0]?.name || 'XI RPL 1',
    major: classes[0]?.major || 'Rekayasa Perangkat Lunak',
    gender: 'L' as 'L' | 'P',
    phone: '',
    parentPhone: '',
    email: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    status: 'Aktif' as const,
  });

  const [newTeacherForm, setNewTeacherForm] = useState({
    nip: '',
    name: '',
    subject: '',
    phone: '',
    email: '',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  });

  const [newScheduleForm, setNewScheduleForm] = useState({
    classId: classes[0]?.id || 'cls-xi-rpl-1',
    day: 'Senin' as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat',
    subject: '',
    teacherName: teachers[0]?.name || '',
    startTime: '07:30',
    endTime: '09:30',
    room: 'Ruang Teori 12',
  });

  const [newSppForm, setNewSppForm] = useState({
    studentId: students[0]?.id || '',
    month: 'September',
    year: 2026,
    amount: 350000,
    dueDate: '2026-09-20',
  });

  const [newNewsForm, setNewNewsForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Akademik' as NewsItem['category'],
    author: 'Tata Usaha SMK TD2',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    isPinned: false,
  });

  const [manualAttendanceStudentId, setManualAttendanceStudentId] = useState<string>(students[0]?.id || '');

  // Attendance metrics calculations for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter((r) => r.timestamp.startsWith(todayStr));
  const hadirCount = todayRecords.filter((r) => r.status === 'HADIR').length;
  const terlambatCount = todayRecords.filter((r) => r.status === 'TERLAMBAT').length;
  const izinCount = todayRecords.filter((r) => r.status === 'IZIN' || r.status === 'SAKIT').length;
  const totalStudentsCount = students.length;
  const belumHadirCount = Math.max(0, totalStudentsCount - (hadirCount + terlambatCount + izinCount));

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Handle Handlers
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCls = classes.find((c) => c.id === newStudentForm.classId);
    addStudent({
      ...newStudentForm,
      className: selectedCls?.name || 'XI RPL 1',
      major: selectedCls?.major || 'Rekayasa Perangkat Lunak',
    });
    setIsAddStudentModalOpen(false);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    addTeacher(newTeacherForm);
    setIsAddTeacherModalOpen(false);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    addSchedule(newScheduleForm);
    setIsAddScheduleModalOpen(false);
  };

  const handleCreateSpp = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find((s) => s.id === newSppForm.studentId);
    if (!targetStudent) return;
    createSppBill({
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      studentNisn: targetStudent.nisn,
      className: targetStudent.className,
      month: newSppForm.month,
      year: newSppForm.year,
      amount: newSppForm.amount,
      status: 'UNPAID',
      dueDate: newSppForm.dueDate,
      vaNumber: `8808${targetStudent.nisn}`,
    });
    setIsAddSppModalOpen(false);
  };

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    addNewsItem(newNewsForm);
    setIsAddNewsModalOpen(false);
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatReply.trim()) return;
    sendChatMessage(adminChatReply, 'admin', activeChatStudentId);
    setAdminChatReply('');
  };

  const handleManualAttendanceSubmit = () => {
    simulateAttendanceScan(manualAttendanceStudentId, qrToken.token);
    setIsManualAttendanceModalOpen(false);
  };

  // Active chat stream
  const activeStudent = students.find((s) => s.id === activeChatStudentId) || students[0];
  const activeChatStream = chatMessages.filter(
    (m) =>
      (m.senderId === activeChatStudentId && m.receiverId === 'admin') ||
      (m.senderId === 'admin' && m.receiverId === activeChatStudentId)
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Top Header Bar - Nordic IKEA Blue */}
      <header className="bg-[#003399] text-white px-6 py-3.5 flex flex-wrap items-center justify-between border-b border-[#002B80] shadow-xs">
        <div className="flex items-center gap-3">
          <SchoolLogo className="w-10 h-11 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black leading-tight uppercase tracking-wide">SMK TRI DHARMA 2 BOGOR</h1>
              <span className="bg-[#FFDA1A] text-[#111111] font-bold px-2 py-0.5 text-[11px] rounded-[2px]">
                ADMIN TU
              </span>
            </div>
            <p className="text-xs text-blue-100">
              Panel Manajemen Sekolah &bull; Dashboard Terpadu Tata Usaha
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-blue-900/60 px-3 py-1.5 rounded-[4px] border border-blue-400/30 font-mono hidden sm:block">
            Token QR: <span className="text-[#FFDA1A] font-bold">{qrToken.hash}</span> ({qrToken.secondsRemaining}s)
          </div>
          <div className="text-right hidden md:block">
            <div className="font-bold text-white leading-tight">Petugas Tata Usaha</div>
            <div className="text-[10px] text-blue-100">Admin Utama</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 bg-[#FFDA1A] hover:bg-yellow-400 text-[#111111] px-3 py-1.5 rounded-[4px] font-bold text-xs transition-colors shadow-xs"
            title="Keluar dari Akun Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar Navigation */}
        <aside className="md:col-span-1 space-y-2">
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-3 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#767676] px-3 py-2">
              Menu Ekosistem
            </div>

            <nav className="space-y-1">
              {[
                { id: 'absensi', label: 'Monitoring Absensi Live', icon: LayoutDashboard },
                { id: 'pengatur_dashboard', label: 'Pengatur Dashboard Siswa', icon: Sliders },
                { id: 'data_induk', label: 'Data Induk Siswa & Guru', icon: Users },
                { id: 'jadwal', label: 'Jadwal Pelajaran', icon: Calendar },
                { id: 'spp', label: 'Keuangan & SPP', icon: CreditCard },
                { id: 'berita', label: 'Portal Berita & Warta', icon: Newspaper },
                { id: 'chat', label: 'Live Chat Terpusat', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminNavTab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[4px] text-xs font-bold text-left transition-colors ${
                      isActive
                        ? 'bg-[#003399] text-white'
                        : 'text-[#111111] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFDA1A]' : 'text-[#767676]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick System Info Box */}
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-3 text-xs shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#111111] border-b border-[#DFDFDF] pb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#003399]" />
              <span>Status Server Real-Time</span>
            </div>
            <div className="flex justify-between text-[#484848] text-[11px]">
              <span>Koneksi WebSocket:</span>
              <span className="text-[#0A8A00] font-bold font-mono">TERHUBUNG</span>
            </div>
            <div className="flex justify-between text-[#484848] text-[11px]">
              <span>Rotasi Token QR:</span>
              <span className="font-mono text-[#003399]">Tiap 30 Detik</span>
            </div>
            <div className="flex justify-between text-[#484848] text-[11px]">
              <span>Sinkronisasi Siswa:</span>
              <span className="text-[#0A8A00] font-bold font-mono">OTOMATIS</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="md:col-span-3 space-y-6">
          {/* ================= 1. TAB MONITORING ABSENSI LIVE ================= */}
          {activeTab === 'absensi' && (
            <div className="space-y-6">
              {/* Top Statistics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                  <div className="text-xs text-[#767676] font-medium">Hadir Tepat Waktu</div>
                  <div className="text-2xl font-bold font-mono text-[#0A8A00] mt-1">{hadirCount}</div>
                  <div className="text-[10px] text-[#484848] mt-0.5">Sebelum 07.15 WIB</div>
                </div>

                <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                  <div className="text-xs text-[#767676] font-medium">Terlambat</div>
                  <div className="text-2xl font-bold font-mono text-[#E87400] mt-1">{terlambatCount}</div>
                  <div className="text-[10px] text-[#484848] mt-0.5">Setelah 07.15 WIB</div>
                </div>

                <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                  <div className="text-xs text-[#767676] font-medium">Izin / Sakit</div>
                  <div className="text-2xl font-bold font-mono text-[#003399] mt-1">{izinCount}</div>
                  <div className="text-[10px] text-[#484848] mt-0.5">Surat Terverifikasi</div>
                </div>

                <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                  <div className="text-xs text-[#767676] font-medium">Belum Presensi</div>
                  <div className="text-2xl font-bold font-mono text-[#CC0008] mt-1">{belumHadirCount}</div>
                  <div className="text-[10px] text-[#484848] mt-0.5">Dari {totalStudentsCount} Total Siswa</div>
                </div>
              </div>

              {/* Attendance Table Header with Actions */}
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#111111]">
                    Log Presensi Siswa Real-time (Hari Ini)
                  </h2>
                  <span className="px-2 py-0.5 bg-[#0A8A00]/10 text-[#0A8A00] text-[10px] font-bold rounded-[2px] font-mono">
                    LIVE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsManualAttendanceModalOpen(true)}
                    className="px-3 py-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Entri Presensi Manual</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#DFDFDF] text-[#111111] text-xs font-bold rounded-[4px] border border-[#DFDFDF] flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Rekap</span>
                  </button>
                </div>
              </div>

              {/* Live Attendance Table */}
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#003399] text-white font-bold">
                      <tr>
                        <th className="p-3">Waktu Presensi</th>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">NISN</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Jarak GPS</th>
                        <th className="p-3">Metode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFDFDF]">
                      {attendanceRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-[#F5F5F5] transition-colors">
                          <td className="p-3 font-mono font-medium text-[#111111]">{rec.timestamp}</td>
                          <td className="p-3 font-bold text-[#111111]">{rec.studentName}</td>
                          <td className="p-3 font-mono text-[#767676]">{rec.studentNisn}</td>
                          <td className="p-3 font-semibold text-[#003399]">{rec.className}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold ${
                                rec.status === 'HADIR'
                                  ? 'bg-green-100 text-[#0A8A00]'
                                  : rec.status === 'TERLAMBAT'
                                  ? 'bg-orange-100 text-[#E87400]'
                                  : 'bg-blue-100 text-[#003399]'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[#484848]">{rec.distanceMeters} meter</td>
                          <td className="p-3 text-[11px] text-[#767676]">{rec.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. TAB PENGATUR DASHBOARD SISWA DINAMIS ================= */}
          {activeTab === 'pengatur_dashboard' && <AdminDynamicDashboardConfig />}

          {/* ================= 3. TAB DATA INDUK SISWA, GURU & KELAS ================= */}
          {activeTab === 'data_induk' && (
            <div className="space-y-4">
              {/* Subtabs Bar */}
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-2 flex gap-2">
                {[
                  { id: 'siswa', label: 'Data Siswa' },
                  { id: 'guru', label: 'Data Dewan Guru' },
                  { id: 'kelas', label: 'Data Kelas & Jurusan' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setDataIndukSubTab(st.id as typeof dataIndukSubTab)}
                    className={`px-4 py-2 rounded-[4px] text-xs font-bold transition-colors ${
                      dataIndukSubTab === st.id
                        ? 'bg-[#003399] text-white'
                        : 'bg-[#F5F5F5] text-[#111111] hover:bg-[#DFDFDF]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Subtab Siswa */}
              {dataIndukSubTab === 'siswa' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-[#767676]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari siswa berdasarkan nama atau NISN..."
                        className="bg-[#F5F5F5] border border-[#DFDFDF] px-3 py-1.5 rounded-[4px] text-xs w-full focus:outline-none focus:border-[#003399]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-[#F5F5F5] border border-[#DFDFDF] px-3 py-1.5 rounded-[4px] text-xs font-semibold text-[#111111]"
                      >
                        <option value="ALL">Semua Kelas</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setIsAddStudentModalOpen(true)}
                        className="px-3.5 py-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Siswa</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#003399] text-white font-bold">
                        <tr>
                          <th className="p-3">NISN</th>
                          <th className="p-3">Nama Siswa</th>
                          <th className="p-3">Kelas &amp; Jurusan</th>
                          <th className="p-3">Kontak / WA</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFDFDF]">
                        {students
                          .filter(
                            (s) =>
                              (filterClass === 'ALL' || s.className === filterClass) &&
                              (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.nisn.includes(searchQuery))
                          )
                          .map((std) => (
                            <tr key={std.id} className="hover:bg-[#F5F5F5]">
                              <td className="p-3 font-mono font-bold text-[#003399]">{std.nisn}</td>
                              <td className="p-3 font-bold text-[#111111]">{std.name}</td>
                              <td className="p-3 text-[#484848]">
                                {std.className} &bull; {std.major}
                              </td>
                              <td className="p-3 font-mono text-[#767676]">{std.phone}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-green-100 text-[#0A8A00] font-bold text-[10px] rounded-[2px]">
                                  {std.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => deleteStudent(std.id)}
                                  className="text-[#CC0008] hover:bg-red-50 p-1.5 rounded-[4px] transition-colors"
                                  title="Hapus Data Siswa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab Guru */}
              {dataIndukSubTab === 'guru' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex justify-between items-center shadow-xs">
                    <h3 className="text-sm font-bold text-[#111111]">Daftar Dewan Guru &amp; Tenaga Pendidik</h3>
                    <button
                      onClick={() => setIsAddTeacherModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Guru</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teachers.map((tch) => (
                      <div
                        key={tch.id}
                        className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={tch.avatarUrl}
                            alt={tch.name}
                            className="w-12 h-12 rounded-[4px] object-cover border border-[#DFDFDF]"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-[#111111]">{tch.name}</h4>
                            <div className="text-[11px] text-[#003399] font-medium">{tch.subject}</div>
                            <div className="text-[10px] text-[#767676] font-mono">NIP: {tch.nip}</div>
                            <div className="text-[10px] text-[#0A8A00] font-mono mt-0.5">WA: {tch.phone}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTeacher(tch.id)}
                          className="text-[#CC0008] hover:bg-red-50 p-1.5 rounded-[4px]"
                          title="Hapus Guru"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab Kelas */}
              {dataIndukSubTab === 'kelas' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs"
                    >
                      <div className="text-xs font-bold text-[#003399] uppercase mb-1">Tingkat {cls.grade}</div>
                      <h4 className="text-base font-bold text-[#111111]">{cls.name}</h4>
                      <div className="text-xs text-[#484848] mt-1">{cls.major}</div>
                      <div className="text-[11px] text-[#767676] mt-2 pt-2 border-t border-[#DFDFDF]">
                        Wali Kelas: <span className="font-semibold text-[#111111]">{cls.homeroomTeacher}</span>
                      </div>
                      <div className="text-[11px] text-[#0A8A00] font-mono font-bold mt-0.5">
                        {cls.totalStudents} Siswa Terdaftar
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. TAB JADWAL PELAJARAN ================= */}
          {activeTab === 'jadwal' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex flex-wrap justify-between items-center gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#111111]">Pengelolaan Jadwal Pelajaran</h3>
                  <select
                    value={filterDay}
                    onChange={(e) => setFilterDay(e.target.value)}
                    className="bg-[#F5F5F5] border border-[#DFDFDF] px-2.5 py-1 rounded-[4px] text-xs font-bold"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((d) => (
                      <option key={d} value={d}>
                        Hari {d}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsAddScheduleModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jadwal</span>
                </button>
              </div>

              <div className="bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#003399] text-white font-bold">
                    <tr>
                      <th className="p-3">Hari &amp; Jam</th>
                      <th className="p-3">Mata Pelajaran</th>
                      <th className="p-3">Guru Pengampu</th>
                      <th className="p-3">Ruangan</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFDFDF]">
                    {schedules
                      .filter((s) => s.day === filterDay)
                      .map((sch) => (
                        <tr key={sch.id} className="hover:bg-[#F5F5F5]">
                          <td className="p-3 font-mono font-bold text-[#003399]">
                            {sch.day}, {sch.startTime} - {sch.endTime}
                          </td>
                          <td className="p-3 font-bold text-[#111111]">{sch.subject}</td>
                          <td className="p-3 text-[#484848]">{sch.teacherName}</td>
                          <td className="p-3 font-mono text-[#767676]">{sch.room}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteSchedule(sch.id)}
                              className="text-[#CC0008] hover:bg-red-50 p-1.5 rounded-[4px]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 5. TAB KEUANGAN & SPP ================= */}
          {activeTab === 'spp' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex flex-wrap justify-between items-center gap-3 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">
                    Manajemen Tagihan &amp; Pembayaran SPP
                  </h3>
                  <p className="text-xs text-[#484848]">Integrasi Gateway Pembayaran Digital &bull; Transaksi Masuk</p>
                </div>

                <button
                  onClick={() => setIsAddSppModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Tagihan Baru</span>
                </button>
              </div>

              <div className="bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#003399] text-white font-bold">
                    <tr>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">Bulan / Tahun</th>
                      <th className="p-3">Nominal</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">No. Kuitansi</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFDFDF]">
                    {sppBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-[#F5F5F5]">
                        <td className="p-3">
                          <div className="font-bold text-[#111111]">{bill.studentName}</div>
                          <div className="text-[10px] text-[#767676] font-mono">{bill.studentNisn} &bull; {bill.className}</div>
                        </td>
                        <td className="p-3 font-semibold text-[#111111]">{bill.month} {bill.year}</td>
                        <td className="p-3 font-mono font-bold text-[#003399]">{formatRupiah(bill.amount)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold ${
                              bill.status === 'PAID'
                                ? 'bg-green-100 text-[#0A8A00]'
                                : 'bg-red-100 text-[#CC0008]'
                            }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#767676]">
                          {bill.receiptNumber || '-'}
                        </td>
                        <td className="p-3 text-right">
                          {bill.status === 'PAID' ? (
                            <button
                              onClick={() => setViewingReceiptBill(bill)}
                              className="px-2.5 py-1 bg-[#F5F5F5] hover:bg-[#DFDFDF] text-[#003399] text-[11px] font-bold rounded-[4px] border border-[#DFDFDF]"
                            >
                              Kuitansi
                            </button>
                          ) : (
                            <button
                              onClick={() => paySppBill(bill.id, 'TUNAI')}
                              className="px-2.5 py-1 bg-[#0A8A00] hover:bg-green-700 text-white text-[11px] font-bold rounded-[4px]"
                            >
                              Tandai Lunas
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 6. TAB PORTAL BERITA & WARTA ================= */}
          {activeTab === 'berita' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex justify-between items-center shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Penerbit Warta &amp; Pengumuman Sekolah</h3>
                  <p className="text-xs text-[#484848]">Publikasi artikel dan info resmi untuk portal siswa</p>
                </div>
                <button
                  onClick={() => setIsAddNewsModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tulis Berita Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {newsItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                    <div className="p-4 flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 bg-[#003399] text-white text-[9px] font-bold rounded-[2px]">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-[#767676] font-mono">{item.publishedAt}</span>
                      </div>
                      <h4 className="font-bold text-xs text-[#111111] leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-[#484848] mt-1 line-clamp-2">{item.summary}</p>
                    </div>
                    <div className="p-3 bg-[#F5F5F5] border-t border-[#DFDFDF] flex justify-between items-center text-xs">
                      <span className="text-[#767676] text-[10px]">Penulis: {item.author}</span>
                      <button
                        onClick={() => deleteNewsItem(item.id)}
                        className="text-[#CC0008] hover:underline font-bold text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 7. TAB LIVE CHAT TERPUSAT ================= */}
          {activeTab === 'chat' && (
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[500px] overflow-hidden">
              {/* Left Student Chat List */}
              <div className="border-r border-[#DFDFDF] bg-[#F5F5F5] p-3 space-y-2">
                <div className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
                  Percakapan Siswa Masuk
                </div>

                <div className="space-y-1.5">
                  {students.map((std) => (
                    <button
                      key={std.id}
                      onClick={() => setActiveChatStudentId(std.id)}
                      className={`w-full p-2.5 rounded-[4px] text-left transition-colors flex items-center gap-2.5 ${
                        activeChatStudentId === std.id
                          ? 'bg-[#003399] text-white'
                          : 'bg-white border border-[#DFDFDF] hover:bg-neutral-100 text-[#111111]'
                      }`}
                    >
                      <img
                        src={std.avatarUrl}
                        alt={std.name}
                        className="w-8 h-8 rounded-[4px] object-cover border border-white/40"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate">{std.name}</div>
                        <div className={`text-[10px] truncate ${activeChatStudentId === std.id ? 'text-blue-100' : 'text-[#767676]'}`}>
                          {std.className}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Active Chat Stream */}
              <div className="md:col-span-2 flex flex-col justify-between bg-white">
                {/* Chat Header */}
                <div className="p-3 bg-[#003399] text-white flex items-center gap-3">
                  <img
                    src={activeStudent.avatarUrl}
                    alt={activeStudent.name}
                    className="w-8 h-8 rounded-[4px] object-cover border border-white"
                  />
                  <div>
                    <h4 className="font-bold text-xs">{activeStudent.name}</h4>
                    <div className="text-[10px] text-blue-100">
                      NISN: {activeStudent.nisn} &bull; Kelas: {activeStudent.className}
                    </div>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F5F5F5]">
                  {activeChatStream.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-[#767676] mb-0.5 px-1">{msg.senderName}</div>
                        <div
                          className={`max-w-[80%] p-2.5 rounded-[4px] text-xs ${
                            isAdmin
                              ? 'bg-[#003399] text-white'
                              : 'bg-white border border-[#DFDFDF] text-[#111111]'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div className="text-[9px] text-[#767676] font-mono mt-0.5 px-1">
                          {msg.timestamp.split(' ')[1]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendAdminReply} className="p-3 border-t border-[#DFDFDF] flex gap-2">
                  <input
                    type="text"
                    value={adminChatReply}
                    onChange={(e) => setAdminChatReply(e.target.value)}
                    placeholder={`Ketik balasan untuk ${activeStudent.name}...`}
                    className="flex-1 bg-[#F5F5F5] border border-[#DFDFDF] px-3 py-2 text-xs rounded-[4px] focus:outline-none focus:border-[#003399]"
                  />
                  <button
                    type="submit"
                    className="bg-[#003399] hover:bg-[#002B80] text-white px-4 py-2 rounded-[4px] text-xs font-bold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}

      {/* Modal Tambah Siswa */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Data Siswa Baru</h3>
              <button onClick={() => setIsAddStudentModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nomor Induk Siswa Nasional (NISN):</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.nisn}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, nisn: e.target.value })}
                  placeholder="0078921006"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  placeholder="Nama Lengkap"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Pilih Kelas:</label>
                <select
                  value={newStudentForm.classId}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, classId: e.target.value })}
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.major}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Nomor Telepon / WA Siswa:</label>
                <input
                  type="text"
                  value={newStudentForm.phone}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Email Siswa:</label>
                <input
                  type="email"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  placeholder="siswa@tridharma2.sch.id"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-3 py-2 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003399] text-white font-bold rounded-[4px]"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Tambah Guru */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Data Guru Baru</h3>
              <button onClick={() => setIsAddTeacherModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeacher} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">NIP Guru:</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.nip}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, nip: e.target.value })}
                  placeholder="198701012010011002"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nama Lengkap &amp; Gelar:</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                  placeholder="Drs. Mulyadi, M.Pd"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Mata Pelajaran:</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.subject}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, subject: e.target.value })}
                  placeholder="Fisika Terapan / Pemrograman"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nomor WhatsApp Resmi:</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.phone}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                  placeholder="081299887766"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="px-3 py-2 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003399] text-white font-bold rounded-[4px]"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Tambah Jadwal */}
      {isAddScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Jadwal Pelajaran</h3>
              <button onClick={() => setIsAddScheduleModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSchedule} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Hari:</label>
                <select
                  value={newScheduleForm.day}
                  onChange={(e) =>
                    setNewScheduleForm({
                      ...newScheduleForm,
                      day: e.target.value as typeof newScheduleForm.day,
                    })
                  }
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Mata Pelajaran:</label>
                <input
                  type="text"
                  required
                  value={newScheduleForm.subject}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, subject: e.target.value })}
                  placeholder="Administrasi Server Jaringan"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Guru Pengampu:</label>
                <select
                  value={newScheduleForm.teacherName}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, teacherName: e.target.value })}
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Jam Mulai:</label>
                  <input
                    type="time"
                    value={newScheduleForm.startTime}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, startTime: e.target.value })}
                    className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Jam Selesai:</label>
                  <input
                    type="time"
                    value={newScheduleForm.endTime}
                    onChange={(e) => setNewScheduleForm({ ...newScheduleForm, endTime: e.target.value })}
                    className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Ruangan:</label>
                <input
                  type="text"
                  value={newScheduleForm.room}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, room: e.target.value })}
                  placeholder="Lab RPL 1 / Ruang Teori 12"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleModalOpen(false)}
                  className="px-3 py-2 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003399] text-white font-bold rounded-[4px]"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Tambah Tagihan SPP */}
      {isAddSppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Buat Tagihan SPP Baru</h3>
              <button onClick={() => setIsAddSppModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSpp} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Pilih Siswa:</label>
                <select
                  value={newSppForm.studentId}
                  onChange={(e) => setNewSppForm({ ...newSppForm, studentId: e.target.value })}
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className}) - NISN: {s.nisn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Bulan:</label>
                  <select
                    value={newSppForm.month}
                    onChange={(e) => setNewSppForm({ ...newSppForm, month: e.target.value })}
                    className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                  >
                    {[
                      'Januari',
                      'Februari',
                      'Maret',
                      'April',
                      'Mei',
                      'Juni',
                      'Juli',
                      'Agustus',
                      'September',
                      'Oktober',
                      'November',
                      'Desember',
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Tahun:</label>
                  <input
                    type="number"
                    value={newSppForm.year}
                    onChange={(e) => setNewSppForm({ ...newSppForm, year: Number(e.target.value) })}
                    className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Nominal Tagihan (Rp):</label>
                <input
                  type="number"
                  value={newSppForm.amount}
                  onChange={(e) => setNewSppForm({ ...newSppForm, amount: Number(e.target.value) })}
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-mono font-bold text-[#003399]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Batas Waktu Pembayaran (Jatuh Tempo):</label>
                <input
                  type="date"
                  value={newSppForm.dueDate}
                  onChange={(e) => setNewSppForm({ ...newSppForm, dueDate: e.target.value })}
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSppModalOpen(false)}
                  className="px-3 py-2 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003399] text-white font-bold rounded-[4px]"
                >
                  Terbitkan Tagihan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Tambah Berita */}
      {isAddNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-lg overflow-hidden shadow-xl"
          >
            <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tulis Warta / Berita Sekolah Baru</h3>
              <button onClick={() => setIsAddNewsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNews} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Judul Berita:</label>
                <input
                  type="text"
                  required
                  value={newNewsForm.title}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, title: e.target.value })}
                  placeholder="Judul Pengumuman atau Berita"
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px] font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Kategori:</label>
                  <select
                    value={newNewsForm.category}
                    onChange={(e) =>
                      setNewNewsForm({
                        ...newNewsForm,
                        category: e.target.value as NewsItem['category'],
                      })
                    }
                    className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                  >
                    {['Akademik', 'Prestasi', 'Kegiatan', 'OSIS', 'Penting'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Penulis:</label>
                  <input
                    type="text"
                    value={newNewsForm.author}
                    onChange={(e) => setNewNewsForm({ ...newNewsForm, author: e.target.value })}
                    className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Ringkasan Singkat:</label>
                <input
                  type="text"
                  required
                  value={newNewsForm.summary}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, summary: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat..."
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Konten Lengkap Berita:</label>
                <textarea
                  rows={4}
                  required
                  value={newNewsForm.content}
                  onChange={(e) => setNewNewsForm({ ...newNewsForm, content: e.target.value })}
                  placeholder="Tulis detail pengumuman selengkapnya..."
                  className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2 rounded-[4px]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNewsModalOpen(false)}
                  className="px-3 py-2 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003399] text-white font-bold rounded-[4px]"
                >
                  Publikasikan Berita
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Entri Presensi Manual */}
      {isManualAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-sm overflow-hidden shadow-xl"
          >
            <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Presensi Manual Siswa</h3>
              <button onClick={() => setIsManualAttendanceModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="text-[#484848]">
                Pilih siswa untuk diverifikasi kehadirannya secara langsung oleh Tata Usaha:
              </p>
              <select
                value={manualAttendanceStudentId}
                onChange={(e) => setManualAttendanceStudentId(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2.5 rounded-[4px] font-semibold text-[#111111]"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className})
                  </option>
                ))}
              </select>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsManualAttendanceModalOpen(false)}
                  className="px-3 py-2 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF] font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleManualAttendanceSubmit}
                  className="px-4 py-2 bg-[#0A8A00] text-white font-bold rounded-[4px]"
                >
                  Verifikasi Hadir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Kuitansi Modal View */}
      <StudentReceiptModal
        bill={viewingReceiptBill}
        onClose={() => setViewingReceiptBill(null)}
      />
    </div>
  );
};
