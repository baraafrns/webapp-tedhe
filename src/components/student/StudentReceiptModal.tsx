import React from 'react';
import { SppBill } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { motion } from 'motion/react';
import { X, CheckCircle2, Printer, Download, ShieldCheck } from 'lucide-react';

interface StudentReceiptModalProps {
  bill: SppBill | null;
  onClose: () => void;
}

export const StudentReceiptModal: React.FC<StudentReceiptModalProps> = ({ bill, onClose }) => {
  if (!bill) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-lg overflow-hidden shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FFDA1A]" />
            <h3 className="font-bold text-sm sm:text-base">Kuitansi Pembayaran Digital Resmi</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-[#FFDA1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Receipt Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh] text-[#111111] bg-white">
          {/* School Official Kop Surat with Logo */}
          <div className="border-b-2 border-[#003399] pb-4 mb-4 flex items-center gap-4">
            <div className="shrink-0">
              <SchoolLogo className="w-14 h-16" />
            </div>
            <div className="text-left flex-1">
              <div className="text-[11px] uppercase tracking-widest font-bold text-[#003399]">
                YAYASAN PENDIDIKAN TRI DHARMA
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#111111] leading-tight">
                SMK TRI DHARMA 2 BOGOR
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#484848] mt-0.5 leading-snug">
                Jl. KH. Sholeh Iskandar No. 8, Kedungbadak, Tanah Sareal, Kota Bogor &bull; Telp. (0251) 8332145
              </p>
            </div>
          </div>

          {/* Receipt Title & Number */}
          <div className="flex justify-between items-center bg-[#F5F5F5] border border-[#DFDFDF] p-3 rounded-[4px] mb-4">
            <div>
              <div className="text-[10px] text-[#767676] uppercase font-bold tracking-wider">No. Kuitansi Elektronik</div>
              <div className="font-mono font-bold text-sm text-[#003399]">{bill.receiptNumber || 'KW/STD2/2026/08/0101'}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#767676] uppercase font-bold tracking-wider">Status Transaksi</div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#0A8A00] bg-green-100 px-2 py-0.5 rounded-[2px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                LUNAS (VERIFIED)
              </div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4 pb-3 border-b border-[#DFDFDF]">
            <div>
              <span className="text-[#767676] block">Nama Siswa:</span>
              <span className="font-bold text-[#111111]">{bill.studentName}</span>
            </div>
            <div>
              <span className="text-[#767676] block">NISN / Kelas:</span>
              <span className="font-mono font-bold text-[#111111]">{bill.studentNisn} &bull; {bill.className}</span>
            </div>
            <div>
              <span className="text-[#767676] block">Tagihan Pembayaran:</span>
              <span className="font-semibold text-[#111111]">SPP Bulan {bill.month} {bill.year}</span>
            </div>
            <div>
              <span className="text-[#767676] block">Waktu Pembayaran:</span>
              <span className="font-mono text-[#111111]">{bill.paidAt || '2026-08-16 07:30:00'}</span>
            </div>
            <div>
              <span className="text-[#767676] block">Metode Pembayaran:</span>
              <span className="font-semibold text-[#003399]">{bill.paymentMethod || 'QRIS Gateway'}</span>
            </div>
            <div>
              <span className="text-[#767676] block">ID Transaksi Gateway:</span>
              <span className="font-mono text-[#484848]">SANDBOX-MID-{bill.id}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-[#003399]/5 border border-[#003399]/20 p-4 rounded-[4px] mb-5 flex justify-between items-center">
            <div>
              <div className="text-xs text-[#484848]">Jumlah Pembayaran:</div>
              <div className="text-2xl font-bold font-mono text-[#003399]">{formatRupiah(bill.amount)}</div>
            </div>
            <div className="text-right text-[11px] text-[#484848] italic">
              Terbilang: Tiga Ratus Lima Puluh Ribu Rupiah
            </div>
          </div>

          {/* Official Stamp & Sign Note */}
          <div className="flex justify-between items-end text-xs text-[#484848] pt-2">
            <div>
              <p className="text-[10px] text-[#767676] max-w-[260px]">
                Dokumen ini merupakan bukti pembayaran elektronik sah yang diterbitkan otomatis oleh sistem keuangan SMK Tri Dharma 2 Bogor.
              </p>
            </div>
            <div className="text-center shrink-0 ml-4">
              <div className="text-[11px]">Bagian Keuangan</div>
              <div className="my-1.5 py-1 px-2 border border-dashed border-[#003399] text-[#003399] font-bold text-[10px] rounded-[2px] bg-blue-50">
                TERVERIFIKASI SISTEM
              </div>
              <div className="font-bold text-[#111111]">Tata Usaha TD2</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F5F5F5] border-t border-[#DFDFDF] px-4 py-3 flex justify-between items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#DFDFDF] text-[#111111] text-xs font-bold rounded-[4px] border border-[#DFDFDF] cursor-pointer"
          >
            Tutup
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white hover:bg-neutral-100 text-[#003399] text-xs font-bold rounded-[4px] border border-[#003399] flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold rounded-[4px] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Simpan PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
