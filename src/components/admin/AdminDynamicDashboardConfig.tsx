import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  Save,
  RotateCcw,
  Smartphone,
  Eye,
  Info,
} from 'lucide-react';

export const AdminDynamicDashboardConfig: React.FC = () => {
  const { dashboardConfig, updateDashboardConfig } = useApp();

  const [formConfig, setFormConfig] = useState(dashboardConfig);
  const [saveAlert, setSaveAlert] = useState(false);

  const handleToggle = (key: keyof typeof formConfig) => {
    setFormConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    updateDashboardConfig(formConfig);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2500);
  };

  const handleReset = () => {
    setFormConfig(dashboardConfig);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#003399]" />
            <h2 className="text-base font-bold text-[#111111]">
              Pengatur Tata Letak &amp; Modul Dashboard Siswa
            </h2>
          </div>
          <p className="text-xs text-[#484848] mt-1">
            Atur visibilitas widget, pengumuman sekolah, mode ujian, dan batas radius GPS yang tampil di layar HP Siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-[#F5F5F5] hover:bg-[#DFDFDF] text-[#111111] text-xs font-bold rounded-[4px] border border-[#DFDFDF] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4 text-[#FFDA1A]" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Save Notification */}
      {saveAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#0A8A00] text-white p-3 rounded-[4px] text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-[#FFDA1A]" />
          <span>Pengaturan Dashboard Siswa berhasil disimpan dan disinkronkan ke seluruh perangkat siswa.</span>
        </motion.div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Widget Toggles & Banners */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Modul Widget Siswa */}
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
              1. Visibilitas Modul &amp; Widget HP Siswa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'showQuickScanWidget',
                  label: 'Widget Pintasan Quick Scan QR',
                  desc: 'Menampilkan tombol pemindai absensi dan status GPS di beranda siswa.',
                  checked: formConfig.showQuickScanWidget,
                },
                {
                  id: 'showTodayScheduleWidget',
                  label: 'Widget Jadwal Pelajaran Hari Ini',
                  desc: 'Menampilkan ringkasan mata pelajaran yang sedang berlangsung hari ini.',
                  checked: formConfig.showTodayScheduleWidget,
                },
                {
                  id: 'showSppSummaryWidget',
                  label: 'Widget Kartu Tagihan SPP Aktif',
                  desc: 'Menampilkan tagihan yang belum lunas beserta tombol bayar langsung.',
                  checked: formConfig.showSppSummaryWidget,
                },
                {
                  id: 'showNewsBannerWidget',
                  label: 'Widget Berita & Warta Sekolah',
                  desc: 'Menampilkan artikel pengumuman resmi terbaru sekolah di beranda siswa.',
                  checked: formConfig.showNewsBannerWidget,
                },
                {
                  id: 'showTeacherDirectoryWidget',
                  label: 'Widget Kontak Cepat Guru',
                  desc: 'Menampilkan daftar kontak cepat WhatsApp dewan guru pengajar.',
                  checked: formConfig.showTeacherDirectoryWidget,
                },
                {
                  id: 'showAttendanceHistoryWidget',
                  label: 'Widget Riwayat Presensi Siswa',
                  desc: 'Menampilkan log kehadiran siswa hari ini beserta status tepat waktu/terlambat.',
                  checked: formConfig.showAttendanceHistoryWidget,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id as keyof typeof formConfig)}
                  className={`p-3.5 border rounded-[4px] cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    item.checked
                      ? 'border-[#003399] bg-[#003399]/5'
                      : 'border-[#DFDFDF] bg-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#111111]">{item.label}</div>
                    <div className="text-[11px] text-[#484848] mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}}
                    className="mt-0.5 accent-[#003399] w-4 h-4"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Banner Pengumuman Global */}
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-2">
              <h3 className="text-sm font-bold text-[#111111]">
                2. Pengumuman Banner Utama di HP Siswa
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-[#484848]">Status Banner:</span>
                <input
                  type="checkbox"
                  checked={formConfig.bannerAnnouncementActive}
                  onChange={() => handleToggle('bannerAnnouncementActive')}
                  className="accent-[#003399] w-4 h-4"
                />
                <span className={`text-xs font-bold ${formConfig.bannerAnnouncementActive ? 'text-[#0A8A00]' : 'text-[#767676]'}`}>
                  {formConfig.bannerAnnouncementActive ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Isi Teks Pengumuman Sekolah:
              </label>
              <textarea
                value={formConfig.bannerAnnouncementText}
                onChange={(e) =>
                  setFormConfig((prev) => ({ ...prev, bannerAnnouncementText: e.target.value }))
                }
                rows={3}
                className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-2.5 rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                placeholder="Tulis pesan pengumuman penting yang akan tampil di bagian paling atas beranda siswa..."
              />
            </div>
          </div>

          {/* Section 3: Mode Ujian & Event Khusus */}
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#003399]" />
                <h3 className="text-sm font-bold text-[#111111]">
                  3. Mode Ujian Semester / Agenda Khusus
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-[#484848]">Status Mode Ujian:</span>
                <input
                  type="checkbox"
                  checked={formConfig.examModeActive}
                  onChange={() => handleToggle('examModeActive')}
                  className="accent-[#003399] w-4 h-4"
                />
                <span className={`text-xs font-bold ${formConfig.examModeActive ? 'text-[#0A8A00]' : 'text-[#767676]'}`}>
                  {formConfig.examModeActive ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">
                Catatan / Instruksi Mode Ujian:
              </label>
              <input
                type="text"
                value={formConfig.examModeNote}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, examModeNote: e.target.value }))}
                className="w-full bg-[#F5F5F5] border border-[#DFDFDF] px-3 py-2 rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
              />
            </div>
          </div>

          {/* Section 4: Geofencing GPS Setting */}
          <div className="bg-white border border-[#DFDFDF] rounded-[4px] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DFDFDF] pb-2">
              <MapPin className="w-4 h-4 text-[#003399]" />
              <h3 className="text-sm font-bold text-[#111111]">
                4. Batas Toleransi Radius Geofencing GPS
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F5F5F5] border border-[#DFDFDF] p-4 rounded-[4px]">
              <div>
                <div className="text-xs font-bold text-[#111111]">
                  Radius Maksimal Absensi: {formConfig.allowedGpsRadiusMeters} Meter
                </div>
                <p className="text-[11px] text-[#484848] mt-0.5">
                  Siswa yang berada lebih dari jarak ini dari gerbang SMK Tri Dharma 2 akan ditolak sistem.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={25}
                  value={formConfig.allowedGpsRadiusMeters}
                  onChange={(e) =>
                    setFormConfig((prev) => ({
                      ...prev,
                      allowedGpsRadiusMeters: Number(e.target.value),
                    }))
                  }
                  className="accent-[#003399] w-36"
                />
                <span className="font-mono font-bold text-xs bg-white px-2 py-1 border border-[#DFDFDF] rounded-[2px]">
                  {formConfig.allowedGpsRadiusMeters}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview of Student Screen */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
            <Smartphone className="w-4 h-4 text-[#003399]" />
            <span>Simulasi Tampilan HP Siswa Real-time</span>
          </div>

          <div className="bg-[#111111] p-3 rounded-[8px] shadow-lg max-w-xs mx-auto border-4 border-[#333333]">
            {/* Phone Screen Mockup */}
            <div className="bg-[#F5F5F5] rounded-[4px] overflow-hidden text-[10px] space-y-2 p-2.5 min-h-[500px]">
              {/* Phone Header */}
              <div className="bg-[#003399] text-white p-2 rounded-[2px] flex justify-between items-center font-bold text-[10px]">
                <span>SMK TRI DHARMA 2</span>
                <span className="text-[8px] bg-[#FFDA1A] text-[#111111] px-1 rounded-[2px]">XI RPL 1</span>
              </div>

              {/* Banner if active */}
              {formConfig.bannerAnnouncementActive && (
                <div className="bg-[#003399]/10 border-l-2 border-[#003399] p-1.5 rounded-r-[2px] text-[8px] text-[#111111]">
                  <span className="font-bold block">Pengumuman:</span>
                  <span className="line-clamp-2">{formConfig.bannerAnnouncementText}</span>
                </div>
              )}

              {/* Exam Mode if active */}
              {formConfig.examModeActive && (
                <div className="bg-[#FFDA1A] text-[#111111] p-1 rounded-[2px] text-[8px] font-bold">
                  {formConfig.examModeNote}
                </div>
              )}

              {/* Quick Scan Widget */}
              {formConfig.showQuickScanWidget && (
                <div className="bg-white border border-[#DFDFDF] p-2 rounded-[2px]">
                  <div className="font-bold text-[#003399] mb-1">Presensi Hari Ini</div>
                  <div className="bg-[#003399] text-white text-center py-1 font-bold rounded-[2px]">
                    Buka Pemindai QR
                  </div>
                </div>
              )}

              {/* SPP Widget */}
              {formConfig.showSppSummaryWidget && (
                <div className="bg-white border border-[#DFDFDF] p-2 rounded-[2px]">
                  <div className="flex justify-between font-bold">
                    <span>Tagihan SPP</span>
                    <span className="text-[#CC0008]">UNPAID</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#003399] mt-0.5">Rp 350.000</div>
                </div>
              )}

              {/* Schedule Widget */}
              {formConfig.showTodayScheduleWidget && (
                <div className="bg-white border border-[#DFDFDF] p-2 rounded-[2px]">
                  <div className="font-bold text-[#111111]">Jadwal Hari Ini</div>
                  <div className="bg-[#F5F5F5] p-1 mt-1 rounded-[2px] text-[8px]">
                    Pemrograman Web &bull; 07:30
                  </div>
                </div>
              )}

              {/* News Widget */}
              {formConfig.showNewsBannerWidget && (
                <div className="bg-white border border-[#DFDFDF] p-2 rounded-[2px]">
                  <div className="font-bold text-[#111111]">Warta Sekolah</div>
                  <div className="text-[8px] text-[#484848] mt-0.5 line-clamp-1">
                    Pelaksanaan Asesmen Sumatif Tengah Semester...
                  </div>
                </div>
              )}

              {/* Teacher Widget */}
              {formConfig.showTeacherDirectoryWidget && (
                <div className="bg-white border border-[#DFDFDF] p-2 rounded-[2px]">
                  <div className="font-bold text-[#111111]">Kontak Dewan Guru</div>
                  <div className="text-[8px] text-[#0A8A00] mt-0.5">WhatsApp Guru Aktif</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
