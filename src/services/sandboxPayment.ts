import { PaymentMethod } from '../types';

export interface SandboxTransaction {
  orderId: string;
  transactionId: string;
  grossAmount: number;
  paymentType: PaymentMethod;
  transactionStatus: 'PENDING' | 'SETTLEMENT' | 'EXPIRE' | 'DENY';
  createdAt: string;
  settledAt?: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  itemDetails: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  paymentDetails: {
    qrisUrl?: string;
    qrisPayload?: string;
    vaNumber?: string;
    bank?: string;
    merchantName: string;
    expiryTime: string;
  };
  signatureKey: string;
  approvalCode?: string;
}

export class SandboxPaymentService {
  private static instance: SandboxPaymentService;

  public static getInstance(): SandboxPaymentService {
    if (!SandboxPaymentService.instance) {
      SandboxPaymentService.instance = new SandboxPaymentService();
    }
    return SandboxPaymentService.instance;
  }

  /**
   * Creates a sandbox transaction order for SPP bill
   */
  public async createTransaction(params: {
    billId: string;
    amount: number;
    month: string;
    year: number;
    studentId: string;
    studentName: string;
    studentNisn: string;
    method: PaymentMethod;
  }): Promise<SandboxTransaction> {
    const timestamp = Date.now();
    const orderId = `TRD-SPP-${params.year}${params.month.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `SB-TX-${timestamp}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    let vaNumber = '';
    let bank = '';
    let qrisPayload = '';

    if (params.method === 'QRIS') {
      qrisPayload = `00020101021226580016ID.CO.TRIDHARMA01189360000000000000005204581253033605405${params.amount}5802ID5920SMK TRI DHARMA 2 BGR6005BOGOR6304${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      const bankPrefixes: Record<string, { prefix: string; name: string }> = {
        VA_BCA: { prefix: '8808', name: 'Bank Central Asia (BCA)' },
        VA_MANDIRI: { prefix: '8908', name: 'Bank Mandiri' },
        VA_BNI: { prefix: '8277', name: 'Bank Negara Indonesia (BNI)' },
        VA_BRI: { prefix: '1029', name: 'Bank Rakyat Indonesia (BRI)' },
      };

      const bankInfo = bankPrefixes[params.method] || { prefix: '8800', name: 'Virtual Account' };
      vaNumber = `${bankInfo.prefix}${params.studentNisn}`;
      bank = bankInfo.name;
    }

    const signature = `HMAC-SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

    const tx: SandboxTransaction = {
      orderId,
      transactionId,
      grossAmount: params.amount,
      paymentType: params.method,
      transactionStatus: 'PENDING',
      createdAt: now.toISOString(),
      studentId: params.studentId,
      studentName: params.studentName,
      studentNisn: params.studentNisn,
      itemDetails: [
        {
          id: params.billId,
          name: `SPP Bulan ${params.month} ${params.year}`,
          price: params.amount,
          quantity: 1,
        },
      ],
      paymentDetails: {
        qrisPayload,
        vaNumber,
        bank,
        merchantName: 'SMK TRI DHARMA 2 BOGOR - TU OFFICIAL',
        expiryTime: expiry.toISOString(),
      },
      signatureKey: signature,
    };

    return tx;
  }

  /**
   * Simulates settlement callback from Sandbox Gateway Simulator
   */
  public async simulateSettlement(transaction: SandboxTransaction): Promise<{
    success: boolean;
    settledTx: SandboxTransaction;
    receiptNumber: string;
  }> {
    // Artificial latency for authentic payment verification
    await new Promise((resolve) => setTimeout(resolve, 800));

    const settledAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const receiptNumber = `KW/STD2/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;
    const approvalCode = `APP-${Math.floor(100000 + Math.random() * 900000)}`;

    const settledTx: SandboxTransaction = {
      ...transaction,
      transactionStatus: 'SETTLEMENT',
      settledAt,
      approvalCode,
    };

    return {
      success: true,
      settledTx,
      receiptNumber,
    };
  }
}

export const sandboxPayment = SandboxPaymentService.getInstance();
