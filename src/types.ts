export type AppRole = 'admin' | 'student' | 'terminal';

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA';

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID';

export type PaymentMethod = 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BNI' | 'VA_BRI' | 'TUNAI';

export interface UserProfile {
  id: string;
  nisnOrNip: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  classId?: string;
  className?: string;
  major?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  classId: string;
  className: string;
  major: string;
  gender: 'L' | 'P';
  phone: string;
  parentPhone: string;
  email: string;
  avatarUrl: string;
  status: 'Aktif' | 'Alumni' | 'Pindah';
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  subject: string;
  phone: string;
  email: string;
  avatarUrl: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: 'X' | 'XI' | 'XII';
  major: string;
  homeroomTeacher: string;
  totalStudents: number;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentNisn: string;
  studentName: string;
  className: string;
  timestamp: string;
  status: AttendanceStatus;
  distanceMeters: number;
  latitude: number;
  longitude: number;
  method: 'QR_DYNAMIC' | 'MANUAL_ADMIN';
}

export interface DynamicQrToken {
  token: string;
  timestamp: number;
  expiresAt: number;
  schoolId: string;
  hash: string;
  secondsRemaining: number;
}

export interface SppBill {
  id: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  className: string;
  month: string;
  year: number;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
  vaNumber?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: 'Akademik' | 'Prestasi' | 'Kegiatan' | 'OSIS' | 'Penting';
  author: string;
  publishedAt: string;
  imageUrl: string;
  isPinned: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'admin' | 'student';
  senderName: string;
  receiverId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface StudentDashboardConfig {
  showQuickScanWidget: boolean;
  showTodayScheduleWidget: boolean;
  showSppSummaryWidget: boolean;
  showNewsBannerWidget: boolean;
  showTeacherDirectoryWidget: boolean;
  showAttendanceHistoryWidget: boolean;
  bannerAnnouncementActive: boolean;
  bannerAnnouncementText: string;
  examModeActive: boolean;
  examModeNote: string;
  widgetOrder: string[];
  allowedGpsRadiusMeters: number;
  schoolCoordinates: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
}

export interface TerminalSuccessScanEvent {
  studentName: string;
  studentNisn: string;
  className: string;
  timestamp: string;
  distanceMeters: number;
}
