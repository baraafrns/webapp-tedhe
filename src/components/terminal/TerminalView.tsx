import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QrCodeCanvas } from '../common/QrCodeCanvas';
import { SchoolLogo } from '../common/SchoolLogo';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2, ShieldCheck, MapPin, Volume2, Maximize, Smartphone, Users, LogOut } from 'lucide-react';

export const TerminalView: React.FC = () => {
  const {
    qrToken,
    refreshQrToken,
    terminalRecentScan,
    attendanceRecords,
    students,
    simulateAttendanceScan,
    dashboardConfig,
    logout,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedSimStudentId, setSelectedSimStudentId] = useState<string>(students[0]?.id || 'std-001');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setCurrentTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`);

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
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
      ];
      setCurrentDate(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotalAttendance = attendanceRecords.filter((r) => r.timestamp.startsWith(todayStr)).length;

  const handleSimulateQuickScan = () => {
    simulateAttendanceScan(selectedSimStudentId, qrToken.token);
  };

  const progressPercent = (qrToken.secondsRemaining / 30) * 100;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between">
      {/* Top Header Bar - Nordic IKEA Blue */}
      <header className="bg-[#003399] text-white px-6 py-3.5 flex flex-wrap items-center justify-between shadow-sm border-b border-[#002B80]">
        <div className="flex items-center gap-3">
          <SchoolLogo className="w-10 h-11 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black leading-tight uppercase tracking-wide">SMK TRI DHARMA 2 BOGOR</h1>
              <span className="bg-[#FFDA1A] text-[#111111] font-bold px-2 py-0.5 text-xs rounded-[2px] tracking-wide">
                TERMINAL QR
              </span>
            </div>
            <p className="text-xs text-blue-100 font-normal">
              Stasiun Presensi Kehadiran Siswa Otomatis &bull; Gerbang Utama
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-xl font-bold font-mono text-[#FFDA1A] tracking-wider">{currentTime}</div>
            <div className="text-xs text-blue-100">{currentDate}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshQrToken}
              className="p-2 bg-blue-900/60 hover:bg-blue-900 text-white rounded-[4px] border border-blue-400/30 transition-colors"
              title="Perbarui Token QR Manual"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-blue-900/60 hover:bg-blue-900 text-white rounded-[4px] border border-blue-400/30 transition-colors"
              title="Layar Penuh"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-[#FFDA1A] hover:bg-yellow-400 text-[#111111] px-3 py-2 rounded-[4px] font-bold text-xs transition-colors shadow-xs ml-1"
              title="Keluar / Kunci Terminal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Kunci Terminal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Terminal Display */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col items-center justify-center">
        {/* Success Alert Banner on Scan Event */}
        <AnimatePresence>
          {terminalRecentScan && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full mb-6 bg-[#0A8A00] text-white p-4 rounded-[4px] shadow-md border border-green-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-[4px] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#FFDA1A]" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-green-100">
                    Presensi Berhasil Diverifikasi
                  </div>
                  <div className="text-xl font-bold">{terminalRecentScan.studentName}</div>
                  <div className="text-xs text-green-100 font-mono">
                    NISN: {terminalRecentScan.studentNisn} &bull; Kelas: {terminalRecentScan.className} &bull; Jarak: {terminalRecentScan.distanceMeters}m
                  </div>
                </div>
              </div>
              <div className="text-right font-mono text-sm bg-black/20 px-3 py-1.5 rounded-[4px]">
                {terminalRecentScan.timestamp.split(' ')[1]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Terminal Card */}
        <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-6 sm:p-8 w-full max-w-xl shadow-sm text-center">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] text-xs font-semibold text-[#484848] mb-2">
              <ShieldCheck className="w-4 h-4 text-[#003399]" />
              Enkripsi Dinamis 30 Detik (HMAC-SHA256)
            </div>
            <h2 className="text-2xl font-bold text-[#111111]">Pindai QR Untuk Presensi</h2>
            <p className="text-sm text-[#484848] mt-1">
              Arahkan kamera HP 1 Siswa pada QR Code di bawah ini. Pastikan GPS aktif.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative inline-block my-2">
            <QrCodeCanvas value={qrToken.token} size={280} />

            {/* Inner Center Watermark Badge with Official Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 border border-[#DFDFDF] p-1.5 rounded-[6px] shadow-sm flex items-center justify-center">
                <SchoolLogo className="w-8 h-9" />
              </div>
            </div>
          </div>

          {/* Countdown Progress Bar */}
          <div className="w-full mt-4">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[#484848]">Masa Berlaku Kode QR:</span>
              <span className="font-mono font-bold text-[#003399]">{qrToken.secondsRemaining} detik</span>
            </div>
            <div className="w-full h-2.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] overflow-hidden">
              <motion.div
                className="h-full bg-[#003399]"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.9, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Token Code Technical Data */}
          <div className="mt-4 pt-4 border-t border-[#DFDFDF] flex items-center justify-between text-xs text-[#767676]">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#0A8A00]" />
              <span>Audio Feedback Aktif</span>
            </div>
            <div className="font-mono text-[11px] bg-[#F5F5F5] px-2 py-0.5 border border-[#DFDFDF] rounded-[4px]">
              ID: {qrToken.hash}
            </div>
          </div>
        </div>

        {/* Live Simulation & Stats Panel */}
        <div className="mt-6 w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Attendee Badge */}
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003399]/10 text-[#003399] rounded-[4px] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#767676]">Total Siswa Hadir Hari Ini</div>
              <div className="text-xl font-bold font-mono text-[#111111]">{todayTotalAttendance} Siswa</div>
            </div>
          </div>

          {/* Geo Location Check */}
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFDA1A]/20 text-[#111111] rounded-[4px] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#003399]" />
            </div>
            <div>
              <div className="text-xs text-[#767676]">Radius Validasi Geofencing</div>
              <div className="text-sm font-bold font-mono text-[#111111]">
                Maksimal {dashboardConfig.allowedGpsRadiusMeters} Meter
              </div>
            </div>
          </div>
        </div>

        {/* Quick Simulator Tool for Testing Multi-Device Action */}
        <div className="mt-4 w-full max-w-xl bg-blue-50 border border-blue-200 rounded-[4px] p-3 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#003399]" />
            <span className="font-semibold">Uji Coba Langsung:</span>
            <select
              value={selectedSimStudentId}
              onChange={(e) => setSelectedSimStudentId(e.target.value)}
              className="bg-white border border-blue-300 rounded-[4px] px-2 py-1 text-xs text-[#111111] font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSimulateQuickScan}
            className="bg-[#003399] hover:bg-[#002B80] text-white px-3 py-1.5 rounded-[4px] font-bold text-xs transition-colors"
          >
            Simulasi Pindai Absen
          </button>
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="bg-white border-t border-[#DFDFDF] px-6 py-3 text-center text-xs text-[#767676]">
        SMK TRI DHARMA 2 BOGOR &bull; Sistem Absensi Terdistribusi Dynamic QR &copy; 2026
      </footer>
    </div>
  );
};
