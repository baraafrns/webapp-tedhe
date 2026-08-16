import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { QrCodeCanvas } from '../common/QrCodeCanvas';
import { calculateHaversineDistance } from '../../utils/geoAndCrypto';
import { Camera, MapPin, CheckCircle2, AlertTriangle, X, RefreshCw, Zap, ShieldCheck, Crosshair, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentScannerModal: React.FC<StudentScannerModalProps> = ({ isOpen, onClose }) => {
  const { selectedStudent, qrToken, simulateAttendanceScan, dashboardConfig } = useApp();

  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    distanceMeters?: number;
  }>({ status: 'idle', message: '' });

  const [geoState, setGeoState] = useState<{
    loading: boolean;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: string | null;
  }>({
    loading: true,
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch real native GPS position
  const requestNativeGps = useCallback(() => {
    setGeoState((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setGeoState({
        loading: false,
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Perangkat atau peramban ini tidak mendukung Geolocation GPS.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState({
          loading: false,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          error: null,
        });
      },
      (err) => {
        let msg = 'Gagal mengakses koordinat GPS perangkat.';
        if (err.code === 1) {
          msg = 'Izin akses lokasi (GPS) ditolak oleh pengguna. Silakan aktifkan izin lokasi di peramban Anda.';
        } else if (err.code === 2) {
          msg = 'Sinyal GPS tidak tersedia atau perangkat berada di luar jangkauan satelit.';
        } else if (err.code === 3) {
          msg = 'Waktu permintaan lokasi habis (Timeout GPS).';
        }
        setGeoState({
          loading: false,
          latitude: null,
          longitude: null,
          accuracy: null,
          error: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScanResult({ status: 'idle', message: '' });
      requestNativeGps();
    }
  }, [isOpen, requestNativeGps]);

  if (!isOpen) return null;

  // Calculate live real distance if GPS is available
  const hasGpsCoordinates = geoState.latitude !== null && geoState.longitude !== null;
  const currentDistance = hasGpsCoordinates
    ? calculateHaversineDistance(
        geoState.latitude!,
        geoState.longitude!,
        dashboardConfig.schoolCoordinates.latitude,
        dashboardConfig.schoolCoordinates.longitude
      )
    : null;

  const isWithinRadius = currentDistance !== null && currentDistance <= dashboardConfig.allowedGpsRadiusMeters;

  const handleExecuteRealScan = () => {
    if (!hasGpsCoordinates) {
      setScanResult({
        status: 'error',
        message: 'Presensi ditolak: Koordinat GPS belum terkunci. Aktifkan lokasi perangkat Anda.',
      });
      return;
    }

    setIsProcessing(true);

    const result = simulateAttendanceScan(
      selectedStudent.id,
      qrToken.token,
      geoState.latitude!,
      geoState.longitude!
    );

    if (result.success) {
      setScanResult({
        status: 'success',
        message: result.message,
        distanceMeters: result.distanceMeters,
      });
    } else {
      setScanResult({
        status: 'error',
        message: result.message,
        distanceMeters: result.distanceMeters,
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-md overflow-hidden shadow-lg flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#FFDA1A]" />
            <h3 className="font-bold text-sm sm:text-base">Pemindai Absensi QR Presensi</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#FFDA1A] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Real GPS Status Card */}
          <div className="w-full bg-[#F5F5F5] border border-[#DFDFDF] p-3 rounded-[4px] mb-3 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#111111]">
                <MapPin className="w-4 h-4 text-[#003399]" />
                <span>Geofencing GPS Perangkat Asli:</span>
              </div>
              {geoState.loading ? (
                <span className="font-bold px-2 py-0.5 rounded-[2px] bg-blue-100 text-[#003399] animate-pulse">
                  MENGUNCI GPS...
                </span>
              ) : hasGpsCoordinates ? (
                <span
                  className={`font-bold px-2 py-0.5 rounded-[2px] ${
                    isWithinRadius
                      ? 'bg-[#0A8A00] text-white'
                      : 'bg-[#CC0008] text-white'
                  }`}
                >
                  {isWithinRadius ? 'DALAM RADIUS RESMI' : 'DILUAR RADIUS SEKOLAH'}
                </span>
              ) : (
                <span className="font-bold px-2 py-0.5 rounded-[2px] bg-[#CC0008] text-white">
                  GPS TIDAK TERSEDIA
                </span>
              )}
            </div>

            {/* GPS Metrics */}
            {geoState.loading ? (
              <div className="text-[11px] text-[#484848] flex items-center gap-1.5 py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#003399]" />
                <span>Menghubungi satelit GPS untuk menentukan koordinat presisi...</span>
              </div>
            ) : geoState.error ? (
              <div className="space-y-1.5 py-1">
                <div className="text-[11px] text-[#CC0008] flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{geoState.error}</span>
                </div>
                <button
                  onClick={requestNativeGps}
                  className="px-2.5 py-1 bg-white border border-[#DFDFDF] hover:bg-[#DFDFDF] text-[#111111] font-bold rounded-[2px] text-[10px] flex items-center gap-1"
                >
                  <Crosshair className="w-3 h-3 text-[#003399]" />
                  <span>Coba Kunci GPS Ulang</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-[11px] text-[#484848] font-mono">
                <div className="flex justify-between">
                  <span>Jarak ke SMK Tri Dharma 2:</span>
                  <span className="font-bold text-[#111111]">{currentDistance} meter</span>
                </div>
                <div className="flex justify-between">
                  <span>Batas Toleransi Radius:</span>
                  <span>{dashboardConfig.allowedGpsRadiusMeters} meter</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#767676] pt-1 border-t border-[#DFDFDF]">
                  <span>Koordinat:</span>
                  <span>
                    {geoState.latitude?.toFixed(5)}, {geoState.longitude?.toFixed(5)} (&plusmn;{geoState.accuracy}m)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Viewfinder Area */}
          <div className="relative w-full max-w-[280px] aspect-square bg-[#111111] rounded-[4px] overflow-hidden flex flex-col items-center justify-center p-4 border-2 border-[#003399]">
            {/* Viewfinder Target Corner Brackets */}
            <div className="absolute inset-4 border border-dashed border-[#FFDA1A]/60 rounded-[4px] pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-[#FFDA1A]"></div>
                <div className="w-4 h-4 border-t-2 border-r-2 border-[#FFDA1A]"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-[#FFDA1A]"></div>
                <div className="w-4 h-4 border-b-2 border-r-2 border-[#FFDA1A]"></div>
              </div>
            </div>

            {/* Laser scanning animation bar */}
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-[#FFDA1A] shadow-[0_0_8px_#FFDA1A]"
              animate={{ top: ['20%', '80%', '20%'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            />

            {/* Target QR in camera frame */}
            <div className="opacity-90">
              <QrCodeCanvas value={qrToken.token} size={150} />
            </div>

            <div className="absolute bottom-2 text-center text-[10px] text-white/80 font-mono">
              Token Aktif: {qrToken.hash}
            </div>
          </div>

          {/* Result Alert Message */}
          <AnimatePresence>
            {scanResult.status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`w-full mt-3 p-3 rounded-[4px] border text-xs flex items-start gap-2.5 ${
                  scanResult.status === 'success'
                    ? 'bg-green-50 border-[#0A8A00] text-[#0A8A00]'
                    : 'bg-red-50 border-[#CC0008] text-[#CC0008]'
                }`}
              >
                {scanResult.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {scanResult.status === 'success' ? 'Presensi Berhasil Diterima' : 'Presensi Ditolak'}
                  </div>
                  <div className="text-neutral-700 mt-0.5">{scanResult.message}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Action Trigger */}
          <div className="w-full mt-3 flex flex-col gap-2">
            <button
              onClick={handleExecuteRealScan}
              disabled={isProcessing || geoState.loading}
              className={`w-full font-bold py-2.5 px-4 rounded-[4px] text-sm flex items-center justify-center gap-2 transition-colors shadow-xs ${
                geoState.loading
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#003399] hover:bg-[#002B80] text-white cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFDA1A]" />
                  <span>Memvalidasi Token &amp; GPS...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#FFDA1A]" />
                  <span>Pindai QR Absensi Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F5F5] border-t border-[#DFDFDF] px-4 py-2.5 flex items-center justify-between text-xs text-[#767676]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#003399]" />
            <span>Siswa: {selectedStudent.name}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#484848] font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
