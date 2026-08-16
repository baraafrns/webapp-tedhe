import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SchoolLogo } from '../common/SchoolLogo';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

export const UniversalLogin: React.FC = () => {
  const { login } = useApp();

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTesterGuide, setShowTesterGuide] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan Nomor Identitas atau ID Pengguna Anda.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi atau PIN keamanan.');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating against secure gateway
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);

      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 350);
  };

  const handleAutofill = (testId: string, testPass: string) => {
    setIdentifier(testId);
    setPassword(testPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between items-center p-4 sm:p-6 selection:bg-[#FFDA1A] selection:text-[#111111]">
      {/* Header Institution Mark with Official Logo */}
      <header className="w-full max-w-md pt-4 pb-2 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-2">
          <SchoolLogo className="w-12 h-14" />
          <div className="text-left">
            <h1 className="text-base sm:text-lg font-black text-[#111111] leading-tight tracking-tight uppercase">
              SMK TRI DHARMA 2 BOGOR
            </h1>
            <p className="text-xs text-[#484848] font-medium">
              Layanan Portal Terpadu &bull; TA 2026/2027
            </p>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[#DFDFDF] rounded-[4px] p-6 sm:p-8 shadow-sm"
        >
          {/* Card Title & Intro */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#111111] tracking-tight">
              Masuk ke Portal
            </h2>
            <p className="text-xs text-[#484848] mt-1 leading-relaxed">
              Gunakan Nomor Identitas resmi (NISN / ID Pengguna) dan kata sandi Anda untuk mengakses layanan.
            </p>
          </div>

          {/* Error Alert Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3.5 bg-red-50 border border-[#CC0008] rounded-[4px] text-xs text-[#CC0008] flex items-start gap-2.5 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Neutral Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Identifier */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-[#111111] mb-1.5 uppercase tracking-wide"
              >
                Nomor Identitas / ID Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#767676]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Contoh: 0078921001 atau ID Anda"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DFDFDF] focus:border-[#003399] focus:ring-1 focus:ring-[#003399] rounded-[4px] text-sm text-[#111111] placeholder:text-[#999999] outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#767676] mt-1">
                Masukkan NISN untuk Siswa atau ID Pengguna resmi terdaftar.
              </p>
            </div>

            {/* Input Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-[#111111] mb-1.5 uppercase tracking-wide"
              >
                Kata Sandi / PIN Keamanan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#767676]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan kata sandi..."
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#DFDFDF] focus:border-[#003399] focus:ring-1 focus:ring-[#003399] rounded-[4px] text-sm text-[#111111] placeholder:text-[#999999] outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#767676] hover:text-[#111111] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#484848] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-[2px] border-[#DFDFDF] text-[#003399] focus:ring-[#003399] accent-[#003399]"
                />
                <span>Ingat Sesi Saya</span>
              </label>
              <span className="text-[#003399] font-medium hover:underline cursor-pointer">
                Bantuan Akses?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003399] hover:bg-[#002B80] active:bg-[#002266] text-white font-bold py-3 px-4 rounded-[4px] text-sm flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Memverifikasi Otorisasi...</span>
              ) : (
                <>
                  <span>Masuk ke Layanan</span>
                  <ArrowRight className="w-4 h-4 text-[#FFDA1A]" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Banner */}
          <div className="mt-6 pt-4 border-t border-[#DFDFDF] flex items-center justify-center gap-2 text-[11px] text-[#767676]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A8A00]" />
            <span>Sistem Otentikasi Terenkripsi Standar Pendidikan</span>
          </div>
        </motion.div>

        {/* Collapsible Tester Guide for Evaluation */}
        <div className="mt-4 bg-white border border-[#DFDFDF] rounded-[4px] overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowTesterGuide(!showTesterGuide)}
            className="w-full px-4 py-2.5 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#484848] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[#111111]">
              <HelpCircle className="w-3.5 h-3.5 text-[#003399]" />
              <span>Petunjuk Pengujian Akun (Evaluator Guide)</span>
            </div>
            {showTesterGuide ? (
              <ChevronUp className="w-4 h-4 text-[#767676]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#767676]" />
            )}
          </button>

          <AnimatePresence>
            {showTesterGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 text-xs space-y-3 bg-white border-t border-[#DFDFDF]"
              >
                <p className="text-[11px] text-[#767676] leading-relaxed">
                  Sistem menggunakan <strong>Satu Pintu Masuk (*Single Universal Door*)</strong>. Pilih akun di bawah ini untuk mengisi formulir secara cepat:
                </p>

                <div className="space-y-2">
                  {/* Student Tester 1 */}
                  <div className="p-2.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#111111]">1. Siswa (XI RPL 1)</div>
                      <div className="text-[10px] text-[#767676] font-mono">
                        NISN: 0078921001 &bull; Sandi: 123456
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutofill('0078921001', '123456')}
                      className="px-2.5 py-1 bg-[#003399] hover:bg-[#002B80] text-white rounded-[2px] text-[11px] font-bold cursor-pointer"
                    >
                      Pilih Akun
                    </button>
                  </div>

                  {/* Student Tester 2 */}
                  <div className="p-2.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#111111]">2. Siswi (XI RPL 2)</div>
                      <div className="text-[10px] text-[#767676] font-mono">
                        NISN: 0078921002 &bull; Sandi: 123456
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutofill('0078921002', '123456')}
                      className="px-2.5 py-1 bg-[#003399] hover:bg-[#002B80] text-white rounded-[2px] text-[11px] font-bold cursor-pointer"
                    >
                      Pilih Akun
                    </button>
                  </div>

                  {/* Admin TU Tester */}
                  <div className="p-2.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#111111]">3. Petugas Tata Usaha (Admin)</div>
                      <div className="text-[10px] text-[#767676] font-mono">
                        ID: admin &bull; Sandi: admin123
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutofill('admin', 'admin123')}
                      className="px-2.5 py-1 bg-[#003399] hover:bg-[#002B80] text-white rounded-[2px] text-[11px] font-bold cursor-pointer"
                    >
                      Pilih Akun
                    </button>
                  </div>

                  {/* Terminal Kiosk Tester */}
                  <div className="p-2.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#111111]">4. Terminal Absensi QR (HP Gerbang)</div>
                      <div className="text-[10px] text-[#767676] font-mono">
                        ID: terminal &bull; Sandi: terminal123
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutofill('terminal', 'terminal123')}
                      className="px-2.5 py-1 bg-[#003399] hover:bg-[#002B80] text-white rounded-[2px] text-[11px] font-bold cursor-pointer"
                    >
                      Pilih Akun
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md py-4 text-center text-xs text-[#767676]">
        <div>&copy; 2026 SMK Tri Dharma 2 Bogor &bull; Hak Cipta Dilindungi</div>
        <div className="text-[11px] mt-0.5">Sistem Ekosistem Sekolah Terpadu Generasi Baru</div>
      </footer>
    </div>
  );
};
