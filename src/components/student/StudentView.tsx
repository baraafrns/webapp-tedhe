import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentScannerModal } from './StudentScannerModal';
import { StudentSppModal } from './StudentSppModal';
import { StudentReceiptModal } from './StudentReceiptModal';
import { SchoolLogo } from '../common/SchoolLogo';
import { SppBill, NewsItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Calendar,
  CreditCard,
  Newspaper,
  Users,
  MessageSquare,
  User,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Send,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Info,
  Sparkles,
  MapPin,
  LogOut,
} from 'lucide-react';

type StudentTab = 'beranda' | 'jadwal' | 'spp' | 'berita' | 'guru' | 'chat' | 'profil';

export const StudentView: React.FC = () => {
  const {
    selectedStudent,
    students,
    setSelectedStudent,
    teachers,
    schedules,
    attendanceRecords,
    sppBills,
    newsItems,
    chatMessages,
    sendChatMessage,
    dashboardConfig,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<StudentTab>('beranda');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<SppBill | null>(null);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<SppBill | null>(null);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<NewsItem | null>(null);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'>('Senin');

  // Filter student-specific data
  const studentBills = sppBills.filter((b) => b.studentId === selectedStudent.id);
  const unpaidBill = studentBills.find((b) => b.status === 'UNPAID');
  const studentAttendance = attendanceRecords.filter((a) => a.studentId === selectedStudent.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const hasAttendedToday = studentAttendance.some((a) => a.timestamp.startsWith(todayStr));
  const todayRecord = studentAttendance.find((a) => a.timestamp.startsWith(todayStr));

  // Filter schedules for student's class
  const classSchedules = schedules.filter((s) => s.classId === selectedStudent.classId);
  const todaySchedules = classSchedules.filter((s) => s.day === selectedScheduleDay);

  // Filter chat messages between this student and Admin
  const studentChats = chatMessages.filter(
    (m) =>
      (m.senderId === selectedStudent.id && m.receiverId === 'admin') ||
      (m.senderId === 'admin' && m.receiverId === selectedStudent.id)
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    sendChatMessage(chatInputText, 'student', selectedStudent.id);
    setChatInputText('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 max-w-md mx-auto border-x border-[#DFDFDF] shadow-md flex flex-col">
      {/* Top Header - Nordic IKEA Blue */}
      <header className="bg-[#003399] text-white px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SchoolLogo className="w-8 h-9 shrink-0" />
            <div>
              <h1 className="text-sm font-bold leading-none uppercase tracking-wide">SMK TRI DHARMA 2</h1>
              <span className="text-[11px] text-blue-100 font-normal">Portal Siswa &bull; {selectedStudent.className}</span>
            </div>
          </div>

          {/* Student Header Info & Logout */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 bg-[#FFDA1A] hover:bg-yellow-400 text-[#111111] px-2.5 py-1 rounded-[4px] font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
              title="Keluar dari Akun Siswa"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* ================= TAB BERANDA (DYNAMIC DASHBOARD) ================= */}
        {activeTab === 'beranda' && (
          <div className="space-y-4">
            {/* Global Announcement Banner (Configured by Admin) */}
            {dashboardConfig.bannerAnnouncementActive && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#003399]/5 border-l-4 border-[#003399] p-3 rounded-r-[4px] text-xs text-[#111111] flex items-start gap-2"
              >
                <Info className="w-4 h-4 text-[#003399] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#003399] block mb-0.5">Pengumuman Sekolah:</span>
                  <p className="text-[#484848]">{dashboardConfig.bannerAnnouncementText}</p>
                </div>
              </motion.div>
            )}

            {/* Exam Mode Alert (Configured by Admin) */}
            {dashboardConfig.examModeActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#FFDA1A] text-[#111111] p-3 rounded-[4px] text-xs font-semibold flex items-center justify-between border border-yellow-400"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#003399]" />
                  <span>{dashboardConfig.examModeNote}</span>
                </div>
                <span className="bg-[#003399] text-white px-2 py-0.5 rounded-[2px] text-[10px] font-bold">
                  UJIAN
                </span>
              </motion.div>
            )}

            {/* Student Profile Overview Card */}
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatarUrl}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-[4px] object-cover border border-[#DFDFDF]"
                />
                <div>
                  <h2 className="text-sm font-bold text-[#111111] leading-tight">{selectedStudent.name}</h2>
                  <div className="text-[11px] text-[#484848] font-mono mt-0.5">
                    NISN: {selectedStudent.nisn}
                  </div>
                  <div className="text-[11px] text-[#003399] font-semibold">
                    {selectedStudent.className} &bull; {selectedStudent.major}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-[#0A8A00]/10 text-[#0A8A00] text-[10px] font-bold rounded-[2px] border border-[#0A8A00]/30">
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            {/* WIDGET 1: Quick Scan QR Presensi (Admin Configurable) */}
            {dashboardConfig.showQuickScanWidget && (
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                    <QrCode className="w-4 h-4 text-[#003399]" />
                    <span>Presensi Hari Ini</span>
                  </div>
                  {hasAttendedToday ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A8A00] bg-green-50 px-2 py-0.5 rounded-[2px] border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {todayRecord?.status || 'SUDAH HADIR'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E87400] bg-orange-50 px-2 py-0.5 rounded-[2px] border border-orange-200">
                      <Clock className="w-3.5 h-3.5" />
                      BELUM ABSEN
                    </span>
                  )}
                </div>

                <div className="bg-[#F5F5F5] p-3 rounded-[4px] border border-[#DFDFDF] mb-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#003399]" />
                    <div>
                      <div className="font-semibold text-[#111111]">Lokasi Terminal Sekolah</div>
                      <div className="text-[11px] text-[#767676]">Maks. Radius: {dashboardConfig.allowedGpsRadiusMeters}m</div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono font-bold text-[#003399]">
                    {hasAttendedToday ? todayRecord?.timestamp.split(' ')[1] : 'Batas 07.15 WIB'}
                  </div>
                </div>

                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full bg-[#003399] hover:bg-[#002B80] text-white font-bold py-2.5 px-4 rounded-[4px] text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <QrCode className="w-4 h-4 text-[#FFDA1A]" />
                  <span>Buka Pemindai QR Absensi</span>
                </button>
              </div>
            )}

            {/* WIDGET 2: SPP Summary & Instant Pay (Admin Configurable) */}
            {dashboardConfig.showSppSummaryWidget && unpaidBill && (
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                    <CreditCard className="w-4 h-4 text-[#003399]" />
                    <span>Tagihan SPP Aktif</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#CC0008] bg-red-50 px-2 py-0.5 rounded-[2px] border border-red-200">
                    BELUM LUNAS
                  </span>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-xs font-semibold text-[#111111]">Bulan {unpaidBill.month} {unpaidBill.year}</div>
                    <div className="text-[11px] text-[#767676]">Jatuh Tempo: {unpaidBill.dueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-[#003399]">{formatRupiah(unpaidBill.amount)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBillForPayment(unpaidBill)}
                    className="flex-1 bg-[#FFDA1A] hover:bg-yellow-400 text-[#111111] font-bold py-2 px-3 rounded-[4px] text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Bayar Sekarang (QRIS / VA)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('spp')}
                    className="px-3 py-2 bg-[#F5F5F5] hover:bg-[#DFDFDF] text-[#111111] font-semibold text-xs rounded-[4px] border border-[#DFDFDF]"
                  >
                    Detail
                  </button>
                </div>
              </div>
            )}

            {/* WIDGET 3: Today's Schedule (Admin Configurable) */}
            {dashboardConfig.showTodayScheduleWidget && (
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                    <Calendar className="w-4 h-4 text-[#003399]" />
                    <span>Jadwal Pelajaran ({selectedScheduleDay})</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('jadwal')}
                    className="text-[11px] font-bold text-[#003399] hover:underline flex items-center"
                  >
                    Semua <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {todaySchedules.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#111111]">{item.subject}</div>
                        <div className="text-[11px] text-[#767676]">{item.teacherName} &bull; {item.room}</div>
                      </div>
                      <div className="font-mono text-[11px] font-bold text-[#003399] bg-white px-2 py-1 rounded-[2px] border border-[#DFDFDF]">
                        {item.startTime} - {item.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WIDGET 4: News & Announcement Banner (Admin Configurable) */}
            {dashboardConfig.showNewsBannerWidget && newsItems[0] && (
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs">
                <div className="p-3 border-b border-[#DFDFDF] flex justify-between items-center">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                    <Newspaper className="w-4 h-4 text-[#003399]" />
                    <span>Berita &amp; Informasi Sekolah</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('berita')}
                    className="text-[11px] font-bold text-[#003399] hover:underline flex items-center"
                  >
                    Lainnya <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div
                  onClick={() => setSelectedNewsDetail(newsItems[0])}
                  className="cursor-pointer hover:bg-neutral-50 transition-colors p-3"
                >
                  <img
                    src={newsItems[0].imageUrl}
                    alt={newsItems[0].title}
                    className="w-full h-32 object-cover rounded-[4px] border border-[#DFDFDF] mb-2"
                  />
                  <div className="inline-block px-2 py-0.5 bg-[#003399] text-white text-[9px] font-bold rounded-[2px] mb-1">
                    {newsItems[0].category}
                  </div>
                  <h3 className="text-xs font-bold text-[#111111] leading-snug line-clamp-2">
                    {newsItems[0].title}
                  </h3>
                  <p className="text-[11px] text-[#484848] mt-1 line-clamp-2">
                    {newsItems[0].summary}
                  </p>
                </div>
              </div>
            )}

            {/* WIDGET 5: Teacher Quick Contact (Admin Configurable) */}
            {dashboardConfig.showTeacherDirectoryWidget && (
              <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                    <Users className="w-4 h-4 text-[#003399]" />
                    <span>Kontak Guru Pengajar</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('guru')}
                    className="text-[11px] font-bold text-[#003399] hover:underline flex items-center"
                  >
                    Semua <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {teachers.slice(0, 2).map((tch) => (
                    <div key={tch.id} className="p-2 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] text-xs">
                      <div className="font-bold text-[#111111] truncate">{tch.name}</div>
                      <div className="text-[10px] text-[#767676] truncate">{tch.subject}</div>
                      <a
                        href={`https://wa.me/62${tch.phone.slice(1)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#0A8A00] bg-green-50 px-2 py-0.5 rounded-[2px] border border-green-200"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB JADWAL PELAJARAN ================= */}
        {activeTab === 'jadwal' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#111111] mb-1">Jadwal Pelajaran Mingguan</h2>
              <p className="text-xs text-[#484848]">Kelas: {selectedStudent.className} &bull; {selectedStudent.major}</p>

              {/* Day Selector Chips */}
              <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
                {(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedScheduleDay(day)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[4px] shrink-0 transition-colors ${
                      selectedScheduleDay === day
                        ? 'bg-[#003399] text-white'
                        : 'bg-[#F5F5F5] text-[#111111] border border-[#DFDFDF] hover:bg-[#DFDFDF]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule List for Selected Day */}
            <div className="space-y-2.5">
              {todaySchedules.length > 0 ? (
                todaySchedules.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#DFDFDF] rounded-[4px] p-3.5 shadow-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-[#003399] uppercase mb-0.5">
                        Jam Ke-{idx + 1}
                      </div>
                      <h3 className="font-bold text-sm text-[#111111]">{item.subject}</h3>
                      <div className="text-[11px] text-[#484848] mt-0.5">
                        Guru: <span className="font-semibold">{item.teacherName}</span>
                      </div>
                      <div className="text-[11px] text-[#767676]">
                        Ruangan: <span className="font-mono">{item.room}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs bg-[#003399]/10 text-[#003399] px-2.5 py-1 rounded-[2px]">
                        {item.startTime} - {item.endTime}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-[#DFDFDF] p-6 text-center rounded-[4px] text-xs text-[#767676]">
                  Tidak ada jadwal kegiatan belajar mengajar pada hari {selectedScheduleDay}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB SPP & KEUANGAN ================= */}
        {activeTab === 'spp' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#111111]">Keuangan &amp; Tagihan SPP</h2>
              <p className="text-xs text-[#484848]">Tahun Ajaran 2026/2027 &bull; Nominal: Rp 350.000 / Bulan</p>
            </div>

            {/* List of Bills */}
            <div className="space-y-3">
              {studentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold text-[#111111]">SPP Bulan {bill.month} {bill.year}</div>
                      <div className="text-[11px] text-[#767676]">Jatuh Tempo: {bill.dueDate}</div>
                    </div>
                    <div>
                      {bill.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0A8A00] bg-green-50 px-2 py-0.5 rounded-[2px] border border-green-200">
                          <CheckCircle2 className="w-3 h-3" />
                          LUNAS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#CC0008] bg-red-50 px-2 py-0.5 rounded-[2px] border border-red-200">
                          <AlertCircle className="w-3 h-3" />
                          BELUM BAYAR
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#DFDFDF]">
                    <div className="text-sm font-bold font-mono text-[#003399]">
                      {formatRupiah(bill.amount)}
                    </div>
                    <div>
                      {bill.status === 'PAID' ? (
                        <button
                          onClick={() => setSelectedBillForReceipt(bill)}
                          className="px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#DFDFDF] text-[#003399] font-bold text-xs rounded-[4px] border border-[#DFDFDF] transition-colors"
                        >
                          Lihat Kuitansi
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedBillForPayment(bill)}
                          className="px-3 py-1.5 bg-[#FFDA1A] hover:bg-yellow-400 text-[#111111] font-bold text-xs rounded-[4px] transition-colors"
                        >
                          Bayar Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB BERITA & PENGUMUMAN ================= */}
        {activeTab === 'berita' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#111111]">Warta &amp; Pengumuman Sekolah</h2>
              <p className="text-xs text-[#484848]">Informasi resmi seputar kegiatan akademik dan kesiswaan</p>
            </div>

            <div className="space-y-3">
              {newsItems.map((news) => (
                <div
                  key={news.id}
                  onClick={() => setSelectedNewsDetail(news)}
                  className="bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs cursor-pointer hover:border-[#003399] transition-all"
                >
                  <img src={news.imageUrl} alt={news.title} className="w-full h-36 object-cover" />
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 bg-[#003399] text-white text-[9px] font-bold rounded-[2px]">
                        {news.category}
                      </span>
                      <span className="text-[10px] text-[#767676] font-mono">{news.publishedAt}</span>
                    </div>
                    <h3 className="font-bold text-xs text-[#111111] leading-snug">{news.title}</h3>
                    <p className="text-[11px] text-[#484848] mt-1 line-clamp-2">{news.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB DIREKTORI GURU ================= */}
        {activeTab === 'guru' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#111111]">Direktori Dewan Guru</h2>
              <p className="text-xs text-[#484848]">Kontak resmi guru mata pelajaran dan wali kelas</p>
            </div>

            <div className="space-y-2.5">
              {teachers.map((tch) => (
                <div
                  key={tch.id}
                  className="bg-white border border-[#DFDFDF] rounded-[4px] p-3.5 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={tch.avatarUrl}
                      alt={tch.name}
                      className="w-11 h-11 rounded-[4px] object-cover border border-[#DFDFDF]"
                    />
                    <div>
                      <h3 className="font-bold text-xs text-[#111111]">{tch.name}</h3>
                      <div className="text-[11px] text-[#003399] font-medium">{tch.subject}</div>
                      <div className="text-[10px] text-[#767676] font-mono">NIP: {tch.nip}</div>
                    </div>
                  </div>
                  <div>
                    <a
                      href={`https://wa.me/62${tch.phone.slice(1)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#0A8A00] hover:bg-green-700 text-white font-bold text-xs rounded-[4px] flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB LIVE CHAT (SISWA - ADMIN) ================= */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] shadow-xs flex flex-col h-[70vh]">
            {/* Chat Header */}
            <div className="bg-[#003399] text-white p-3 flex items-center justify-between rounded-t-[4px]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-[4px] flex items-center justify-center font-bold text-xs">
                  TU
                </div>
                <div>
                  <h3 className="font-bold text-xs">Layanan Bantuan Tata Usaha</h3>
                  <p className="text-[10px] text-blue-100">Aktif &bull; SMK Tri Dharma 2</p>
                </div>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#F5F5F5]">
              {studentChats.map((msg) => {
                const isMe = msg.senderRole === 'student';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-[#767676] mb-0.5 px-1">{msg.senderName}</div>
                    <div
                      className={`max-w-[82%] p-2.5 rounded-[4px] text-xs ${
                        isMe
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

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-[#DFDFDF] flex gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="Tulis pesan ke admin/tata usaha..."
                className="flex-1 bg-[#F5F5F5] border border-[#DFDFDF] px-3 py-2 text-xs rounded-[4px] focus:outline-none focus:border-[#003399]"
              />
              <button
                type="submit"
                className="bg-[#003399] hover:bg-[#002B80] text-white px-3 py-2 rounded-[4px] text-xs font-bold transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB PROFIL SISWA ================= */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            {/* Student ID Card Visual */}
            <div className="bg-[#003399] text-white p-5 rounded-[4px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>

              <div className="flex justify-between items-start border-b border-blue-400/40 pb-3 mb-3">
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-bold text-[#FFDA1A]">
                    KARTU TANDA PELAJAR DIGITAL
                  </div>
                  <div className="text-sm font-bold">SMK TRI DHARMA 2 BOGOR</div>
                </div>
                <SchoolLogo className="w-8 h-9 shrink-0" />
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatarUrl}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-[4px] object-cover border-2 border-white"
                />
                <div>
                  <div className="text-base font-bold leading-tight">{selectedStudent.name}</div>
                  <div className="text-xs text-blue-100 font-mono mt-0.5">NISN: {selectedStudent.nisn}</div>
                  <div className="text-xs text-[#FFDA1A] font-semibold mt-0.5">{selectedStudent.className}</div>
                  <div className="text-[11px] text-blue-100">{selectedStudent.major}</div>
                </div>
              </div>
            </div>

            {/* Detailed Biodata Table */}
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#111111] border-b border-[#DFDFDF] pb-2">
                Informasi Biodata Siswa
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#767676] block">Jenis Kelamin:</span>
                  <span className="font-semibold text-[#111111]">
                    {selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                <div>
                  <span className="text-[#767676] block">Status Siswa:</span>
                  <span className="font-semibold text-[#0A8A00]">{selectedStudent.status}</span>
                </div>
                <div>
                  <span className="text-[#767676] block">Email Akun:</span>
                  <span className="font-mono text-[#111111] text-[11px] truncate block">
                    {selectedStudent.email}
                  </span>
                </div>
                <div>
                  <span className="text-[#767676] block">Nomor Telepon:</span>
                  <span className="font-mono text-[#111111]">{selectedStudent.phone}</span>
                </div>
                <div>
                  <span className="text-[#767676] block">Kontak Orang Tua:</span>
                  <span className="font-mono text-[#111111]">{selectedStudent.parentPhone}</span>
                </div>
                <div>
                  <span className="text-[#767676] block">Tahun Pelajaran:</span>
                  <span className="font-semibold text-[#111111]">2026 / 2027</span>
                </div>
              </div>
            </div>

            {/* Attendance Records Table for this student */}
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
              <h3 className="font-bold text-xs text-[#111111] mb-2.5">Riwayat Presensi Terbaru</h3>
              <div className="space-y-2">
                {studentAttendance.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-[#111111]">{rec.timestamp}</div>
                      <div className="text-[10px] text-[#767676]">Metode: {rec.method} &bull; Jarak: {rec.distanceMeters}m</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-[2px] ${
                        rec.status === 'HADIR'
                          ? 'bg-green-100 text-[#0A8A00]'
                          : 'bg-orange-100 text-[#E87400]'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout Action Button Card */}
            <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 shadow-xs">
              <button
                type="button"
                onClick={logout}
                className="w-full bg-[#CC0008] hover:bg-[#A30006] text-white font-bold py-2.5 px-4 rounded-[4px] text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun Siswa</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar - Nordic Yellow Style */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[#DFDFDF] flex items-center justify-around py-1.5 px-2 z-40 shadow-md">
        <button
          onClick={() => setActiveTab('beranda')}
          className={`flex flex-col items-center py-1 px-2 rounded-[4px] transition-colors ${
            activeTab === 'beranda' ? 'text-[#003399] font-bold' : 'text-[#767676] hover:text-[#111111]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex flex-col items-center py-1 px-2 rounded-[4px] transition-colors ${
            activeTab === 'jadwal' ? 'text-[#003399] font-bold' : 'text-[#767676] hover:text-[#111111]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Jadwal</span>
        </button>

        {/* Center Scanner Action Button */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex flex-col items-center -mt-4 bg-[#003399] hover:bg-[#002B80] text-[#FFDA1A] p-2.5 rounded-full border-2 border-white shadow-md transition-transform active:scale-95"
        >
          <QrCode className="w-6 h-6" />
          <span className="text-[9px] font-bold text-white mt-0.5">Scan</span>
        </button>

        <button
          onClick={() => setActiveTab('spp')}
          className={`flex flex-col items-center py-1 px-2 rounded-[4px] transition-colors ${
            activeTab === 'spp' ? 'text-[#003399] font-bold' : 'text-[#767676] hover:text-[#111111]'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">SPP</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center py-1 px-2 rounded-[4px] transition-colors ${
            activeTab === 'chat' ? 'text-[#003399] font-bold' : 'text-[#767676] hover:text-[#111111]'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('profil')}
          className={`flex flex-col items-center py-1 px-2 rounded-[4px] transition-colors ${
            activeTab === 'profil' ? 'text-[#003399] font-bold' : 'text-[#767676] hover:text-[#111111]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profil</span>
        </button>
      </nav>

      {/* Modals */}
      <StudentScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      <StudentSppModal
        isOpen={!!selectedBillForPayment}
        bill={selectedBillForPayment}
        onClose={() => setSelectedBillForPayment(null)}
        onPaymentSuccess={(paidBill) => {
          setSelectedBillForPayment(null);
          setSelectedBillForReceipt(paidBill);
        }}
      />
      <StudentReceiptModal
        bill={selectedBillForReceipt}
        onClose={() => setSelectedBillForReceipt(null)}
      />

      {/* News Article Detail Modal */}
      {selectedNewsDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-lg overflow-hidden shadow-xl max-h-[85vh] flex flex-col"
          >
            <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFDA1A]">
                {selectedNewsDetail.category}
              </span>
              <button
                onClick={() => setSelectedNewsDetail(null)}
                className="text-white hover:text-[#FFDA1A]"
              >
                Tutup
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs text-[#111111]">
              <img
                src={selectedNewsDetail.imageUrl}
                alt={selectedNewsDetail.title}
                className="w-full h-44 object-cover rounded-[4px] border border-[#DFDFDF]"
              />
              <h2 className="text-base font-bold leading-snug">{selectedNewsDetail.title}</h2>
              <div className="text-[11px] text-[#767676] font-mono">
                Dipublikasikan: {selectedNewsDetail.publishedAt} &bull; Oleh: {selectedNewsDetail.author}
              </div>
              <div className="border-t border-[#DFDFDF] pt-3 text-[#484848] leading-relaxed space-y-2">
                <p>{selectedNewsDetail.content}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
