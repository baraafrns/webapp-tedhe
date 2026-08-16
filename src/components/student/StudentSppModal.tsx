import React, { useState } from 'react';
import { SppBill, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';
import { QrCodeCanvas } from '../common/QrCodeCanvas';
import { sandboxPayment, SandboxTransaction } from '../../services/sandboxPayment';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Copy,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Zap,
  Clock,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface StudentSppModalProps {
  bill: SppBill | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paidBill: SppBill) => void;
}

export const StudentSppModal: React.FC<StudentSppModalProps> = ({
  bill,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { paySppBill } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('QRIS');
  const [step, setStep] = useState<'SELECT_METHOD' | 'PAYMENT_SCREEN' | 'SUCCESS'>('SELECT_METHOD');
  const [copiedVa, setCopiedVa] = useState<boolean>(false);
  const [isCreatingTx, setIsCreatingTx] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [activeTx, setActiveTx] = useState<SandboxTransaction | null>(null);
  const [generatedReceiptNo, setGeneratedReceiptNo] = useState<string>('');

  if (!isOpen || !bill) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateSandboxTx = async () => {
    setIsCreatingTx(true);
    try {
      const tx = await sandboxPayment.createTransaction({
        billId: bill.id,
        amount: bill.amount,
        month: bill.month,
        year: bill.year,
        studentId: bill.studentId,
        studentName: bill.studentName,
        studentNisn: bill.studentNisn,
        method: selectedMethod,
      });
      setActiveTx(tx);
      setStep('PAYMENT_SCREEN');
    } catch (err) {
      console.error('Failed to create sandbox transaction', err);
    } finally {
      setIsCreatingTx(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleSimulateSandboxPayment = async () => {
    if (!activeTx) return;
    setIsSettling(true);

    try {
      const result = await sandboxPayment.simulateSettlement(activeTx);
      if (result.success) {
        paySppBill(bill.id, selectedMethod);
        setGeneratedReceiptNo(result.receiptNumber);
        setStep('SUCCESS');
      }
    } catch (err) {
      console.error('Settlement simulation error', err);
    } finally {
      setIsSettling(false);
    }
  };

  const handleFinish = () => {
    onPaymentSuccess({
      ...bill,
      status: 'PAID',
      paidAt: activeTx?.settledAt || new Date().toISOString(),
      receiptNumber: generatedReceiptNo || 'KW/STD2/2026/08/0994',
      paymentMethod: selectedMethod,
    });
    onClose();
    setStep('SELECT_METHOD');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-[#DFDFDF] rounded-[4px] w-full max-w-md overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#003399] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FFDA1A]" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Payment Gateway SPP Digital</h3>
              <div className="text-[10px] text-blue-100 font-mono">SANDBOX GATEWAY API VERIFIED</div>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-[#FFDA1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Bill Summary Banner */}
          <div className="bg-[#F5F5F5] border border-[#DFDFDF] p-3.5 rounded-[4px] mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#767676]">Uraian Tagihan:</span>
              <span className="text-xs font-bold text-[#003399]">SPP Bulan {bill.month} {bill.year}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-[#767676]">Siswa / Kelas:</span>
              <span className="text-xs font-semibold text-[#111111]">{bill.studentName} ({bill.className})</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-[#DFDFDF]">
              <span className="text-xs font-semibold text-[#111111]">Total Bayar:</span>
              <span className="text-lg font-bold font-mono text-[#003399]">{formatRupiah(bill.amount)}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'SELECT_METHOD' && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="text-xs font-bold text-[#111111] uppercase tracking-wide flex items-center justify-between">
                  <span>Pilih Saluran Pembayaran Sandbox:</span>
                  <span className="text-[10px] font-mono text-[#0A8A00] bg-green-50 border border-[#0A8A00]/20 px-1.5 py-0.5 rounded-[2px]">
                    API AKTIF
                  </span>
                </div>

                {/* QRIS Option */}
                <label
                  onClick={() => setSelectedMethod('QRIS')}
                  className={`flex items-center justify-between p-3 border rounded-[4px] cursor-pointer transition-all ${
                    selectedMethod === 'QRIS'
                      ? 'border-[#003399] bg-[#003399]/5 ring-1 ring-[#003399]'
                      : 'border-[#DFDFDF] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-[#DFDFDF] rounded-[4px] flex items-center justify-center text-[#003399]">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#111111]">QRIS Standar Nasional (Instant)</div>
                      <div className="text-[11px] text-[#767676]">GoPay, OVO, Dana, ShopeePay, BCA, Livin, dll</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="method"
                    checked={selectedMethod === 'QRIS'}
                    onChange={() => setSelectedMethod('QRIS')}
                    className="accent-[#003399]"
                  />
                </label>

                {/* Virtual Accounts */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-[#767676]">Transfer Virtual Account Bank:</div>

                  {[
                    { id: 'VA_BCA', name: 'BCA Virtual Account', desc: 'Verifikasi Otomatis 24 Jam' },
                    { id: 'VA_MANDIRI', name: 'Mandiri Virtual Account', desc: 'Verifikasi Otomatis 24 Jam' },
                    { id: 'VA_BNI', name: 'BNI Virtual Account', desc: 'Verifikasi Otomatis 24 Jam' },
                    { id: 'VA_BRI', name: 'BRI Virtual Account (BRIVA)', desc: 'Verifikasi Otomatis 24 Jam' },
                  ].map((va) => (
                    <label
                      key={va.id}
                      onClick={() => setSelectedMethod(va.id as PaymentMethod)}
                      className={`flex items-center justify-between p-3 border rounded-[4px] cursor-pointer transition-all ${
                        selectedMethod === va.id
                          ? 'border-[#003399] bg-[#003399]/5 ring-1 ring-[#003399]'
                          : 'border-[#DFDFDF] hover:bg-[#F5F5F5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] flex items-center justify-center font-bold text-xs text-[#003399]">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111111]">{va.name}</div>
                          <div className="text-[11px] text-[#767676]">{va.desc}</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="method"
                        checked={selectedMethod === va.id}
                        onChange={() => setSelectedMethod(va.id as PaymentMethod)}
                        className="accent-[#003399]"
                      />
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleCreateSandboxTx}
                  disabled={isCreatingTx}
                  className="w-full bg-[#003399] hover:bg-[#002B80] text-white font-bold py-2.5 px-4 rounded-[4px] text-xs flex items-center justify-center gap-2 transition-colors mt-2 shadow-xs cursor-pointer"
                >
                  {isCreatingTx ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FFDA1A]" />
                      <span>Membuat Order Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Proses ke Sandbox Payment Gateway</span>
                      <ArrowRight className="w-4 h-4 text-[#FFDA1A]" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 'PAYMENT_SCREEN' && activeTx && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Gateway Order ID bar */}
                <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-[4px] text-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-blue-800 uppercase font-semibold">Order ID Sandbox:</div>
                    <div className="font-mono font-bold text-[#003399]">{activeTx.orderId}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-blue-900 bg-blue-100 px-2 py-0.5 rounded-[2px] font-mono">
                    <Clock className="w-3 h-3 text-[#003399]" />
                    <span>23:59:59</span>
                  </div>
                </div>

                {selectedMethod === 'QRIS' ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="text-xs font-bold text-[#111111] mb-1">
                      Pindai QRIS Dynamic Sandbox
                    </div>
                    <p className="text-[11px] text-[#767676] mb-3">
                      Buka aplikasi perbankan atau e-wallet untuk scan QR Code resmi di bawah ini.
                    </p>

                    <div className="relative p-2 bg-white border-2 border-[#003399] rounded-[4px] shadow-sm">
                      <QrCodeCanvas
                        value={activeTx.paymentDetails.qrisPayload || 'TRD-SPP-QRIS-DYNAMIC'}
                        size={200}
                      />
                      <div className="absolute top-3 left-3 bg-[#003399] text-white text-[9px] px-1.5 py-0.5 font-bold rounded-[2px]">
                        QRIS RESMI TD2
                      </div>
                    </div>

                    <div className="text-xs font-mono text-[#484848] mt-2">
                      Merchant: <span className="font-bold text-[#111111]">{activeTx.paymentDetails.merchantName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#111111]">Nomor Rekening Virtual Account:</div>
                    <div className="bg-[#F5F5F5] border border-[#DFDFDF] p-3 rounded-[4px]">
                      <div className="text-[11px] text-[#767676] mb-1">{activeTx.paymentDetails.bank}:</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold text-[#003399]">
                          {activeTx.paymentDetails.vaNumber}
                        </span>
                        <button
                          onClick={() => handleCopyText(activeTx.paymentDetails.vaNumber || '')}
                          className="px-2.5 py-1 bg-white border border-[#DFDFDF] hover:bg-neutral-100 rounded-[4px] text-xs font-bold text-[#111111] flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedVa ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#484848] space-y-1 bg-blue-50 border border-blue-100 p-2.5 rounded-[4px]">
                      <div className="font-semibold text-blue-900">Petunjuk Pembayaran Sandbox:</div>
                      <div>1. Buka m-Banking atau ATM &gt; Menu Transfer Virtual Account.</div>
                      <div>2. Masukkan nomor VA di atas.</div>
                      <div>3. Tagihan akan otomatis tertera nominal {formatRupiah(bill.amount)}.</div>
                    </div>
                  </div>
                )}

                {/* Sandbox Payment Simulator Action */}
                <div className="pt-2 border-t border-[#DFDFDF]">
                  <div className="text-[10px] uppercase font-bold text-[#767676] mb-1.5 tracking-wider">
                    Simulator Payment Gateway Sandbox:
                  </div>
                  <button
                    onClick={handleSimulateSandboxPayment}
                    disabled={isSettling}
                    className="w-full bg-[#0A8A00] hover:bg-[#086C00] text-white font-bold py-2.5 px-4 rounded-[4px] text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                  >
                    {isSettling ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#FFDA1A]" />
                        <span>Menerima Notifikasi Webhook Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-[#FFDA1A]" />
                        <span>Simulasikan Pembayaran Berhasil (Sandbox API)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setStep('SELECT_METHOD')}
                    className="w-full mt-2 text-xs font-semibold text-[#484848] hover:underline"
                  >
                    Ubah Metode Pembayaran
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'SUCCESS' && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-3"
              >
                <div className="w-14 h-14 bg-[#0A8A00]/10 text-[#0A8A00] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9 text-[#0A8A00]" />
                </div>
                <h4 className="text-base font-bold text-[#111111]">Pembayaran Berhasil Diverifikasi</h4>
                <p className="text-xs text-[#484848]">
                  Tagihan SPP Bulan {bill.month} {bill.year} sebesar {formatRupiah(bill.amount)} telah dinyatakan LUNAS oleh Gateway.
                </p>

                <div className="bg-[#F5F5F5] border border-[#DFDFDF] p-3 rounded-[4px] text-left text-xs font-mono space-y-1">
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#767676]">No. Kuitansi:</span>
                    <span className="font-bold text-[#003399]">{generatedReceiptNo || 'KW/STD2/2026/08/0994'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#767676]">Order ID Gateway:</span>
                    <span className="text-[#111111]">{activeTx?.orderId || 'TRD-SPP-001'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#767676]">Metode:</span>
                    <span className="font-semibold text-[#111111]">{selectedMethod}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#767676]">Status Gateway:</span>
                    <span className="text-[#0A8A00] font-bold">SETTLEMENT (LUNAS)</span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full bg-[#003399] hover:bg-[#002B80] text-white font-bold py-2.5 px-4 rounded-[4px] text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Lihat Kuitansi Digital &amp; Kembali
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-[#F5F5F5] border-t border-[#DFDFDF] px-4 py-2.5 flex items-center justify-between text-xs text-[#767676]">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-[#003399]" />
            <span>256-Bit SSL Encrypted Payment</span>
          </div>
          <button onClick={onClose} className="text-[#484848] font-semibold hover:underline text-xs">
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
