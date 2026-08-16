import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppRole,
  Student,
  Teacher,
  SchoolClass,
  ScheduleItem,
  AttendanceRecord,
  DynamicQrToken,
  SppBill,
  NewsItem,
  ChatMessage,
  StudentDashboardConfig,
  TerminalSuccessScanEvent,
  PaymentMethod,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SCHEDULES,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_SPP_BILLS,
  INITIAL_NEWS_ITEMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_DASHBOARD_CONFIG,
} from '../data/initialData';
import { calculateHaversineDistance, generateDynamicQrPayload, validateQrToken } from '../utils/geoAndCrypto';
import { playSuccessAttendanceTone, playErrorAttendanceTone } from '../utils/audioBeep';

interface AppContextType {
  activeRole: AppRole | null;
  setActiveRole: (role: AppRole | null) => void;
  selectedStudent: Student;
  setSelectedStudent: (student: Student) => void;
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  schedules: ScheduleItem[];
  attendanceRecords: AttendanceRecord[];
  sppBills: SppBill[];
  newsItems: NewsItem[];
  chatMessages: ChatMessage[];
  dashboardConfig: StudentDashboardConfig;
  qrToken: DynamicQrToken;
  terminalRecentScan: TerminalSuccessScanEvent | null;
  refreshQrToken: () => void;
  updateDashboardConfig: (newConfig: Partial<StudentDashboardConfig>) => void;
  login: (identifier: string, pass: string) => { success: boolean; message: string; role?: AppRole; student?: Student };
  logout: () => void;
  simulateAttendanceScan: (
    studentId: string,
    scannedToken: string,
    userLat?: number,
    userLng?: number
  ) => { success: boolean; message: string; record?: AttendanceRecord; distanceMeters?: number };
  paySppBill: (billId: string, method: PaymentMethod) => void;
  createSppBill: (bill: Omit<SppBill, 'id'>) => void;
  addNewsItem: (news: Omit<NewsItem, 'id' | 'publishedAt'>) => void;
  deleteNewsItem: (id: string) => void;
  sendChatMessage: (messageText: string, senderRole: 'admin' | 'student', targetStudentId?: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  deleteTeacher: (id: string) => void;
  addSchedule: (schedule: Omit<ScheduleItem, 'id'>) => void;
  deleteSchedule: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student>(INITIAL_STUDENTS[0]);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [sppBills, setSppBills] = useState<SppBill[]>(INITIAL_SPP_BILLS);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(INITIAL_NEWS_ITEMS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [dashboardConfig, setDashboardConfig] = useState<StudentDashboardConfig>(INITIAL_DASHBOARD_CONFIG);

  const [qrToken, setQrToken] = useState<DynamicQrToken>(() => generateDynamicQrPayload());
  const [terminalRecentScan, setTerminalRecentScan] = useState<TerminalSuccessScanEvent | null>(null);

  // Dynamic QR generator rotation ticker (30-second slots)
  const refreshQrToken = useCallback(() => {
    setQrToken(generateDynamicQrPayload());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQrToken(generateDynamicQrPayload());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Universal Login Authentication
  const login = useCallback(
    (identifier: string, pass: string) => {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = pass.trim();

      if (!cleanId || !cleanPass) {
        return { success: false, message: 'Nomor Identitas dan Kata Sandi wajib diisi.' };
      }

      // Check 1: Admin / TU Account
      if (
        cleanId === 'admin' ||
        cleanId === 'admin.tu' ||
        cleanId === 'tu' ||
        cleanId === '198503152010011005' ||
        cleanId === 'admin@tridharma2.sch.id'
      ) {
        if (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === '123456' || cleanPass === 'admin.tu') {
          setActiveRole('admin');
          return { success: true, role: 'admin' as AppRole, message: 'Autentikasi Administrator Berhasil.' };
        }
        return { success: false, message: 'Kata sandi akun Administrator tidak sesuai.' };
      }

      // Check 2: Terminal Absensi Kiosk Account
      if (
        cleanId === 'terminal' ||
        cleanId === 'kiosk' ||
        cleanId === 'kiosk-01' ||
        cleanId === 'terminal.qr' ||
        cleanId === 'absen' ||
        cleanId === 'gate-01'
      ) {
        if (cleanPass === 'terminal' || cleanPass === 'kiosk123' || cleanPass === '123456' || cleanPass === 'terminal123') {
          setActiveRole('terminal');
          return { success: true, role: 'terminal' as AppRole, message: 'Aktivasi Terminal Absensi Berhasil.' };
        }
        return { success: false, message: 'Kata sandi otorisasi Terminal tidak sesuai.' };
      }

      // Check 3: Student Account by NISN / Email / Name / ID
      const matchedStudent = students.find(
        (s) =>
          s.nisn.toLowerCase() === cleanId ||
          s.email.toLowerCase() === cleanId ||
          s.name.toLowerCase().includes(cleanId) ||
          s.id.toLowerCase() === cleanId
      );

      if (matchedStudent) {
        if (cleanPass === '123456' || cleanPass === matchedStudent.nisn || cleanPass.length >= 4) {
          setSelectedStudent(matchedStudent);
          setActiveRole('student');
          return {
            success: true,
            role: 'student' as AppRole,
            student: matchedStudent,
            message: `Selamat datang, ${matchedStudent.name}.`,
          };
        }
        return { success: false, message: 'Kata sandi atau PIN keamanan salah.' };
      }

      return {
        success: false,
        message: 'Nomor Identitas (NISN / ID Pengguna) tidak ditemukan dalam sistem.',
      };
    },
    [students]
  );

  const logout = useCallback(() => {
    setActiveRole(null);
  }, []);

  // Update Student Dashboard Configuration (by Admin)
  const updateDashboardConfig = useCallback((newConfig: Partial<StudentDashboardConfig>) => {
    setDashboardConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  }, []);

  // Scan attendance execution & multi-device sync
  const simulateAttendanceScan = useCallback(
    (studentId: string, scannedToken: string, userLat?: number, userLng?: number) => {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        playErrorAttendanceTone();
        return { success: false, message: 'Data siswa tidak ditemukan di sistem database.' };
      }

      // 1. Validate QR Token
      const isTokenValid = validateQrToken(scannedToken);
      if (!isTokenValid) {
        playErrorAttendanceTone();
        return { success: false, message: 'Kode QR tidak valid atau sudah kedaluwarsa (rotasi 30 detik).' };
      }

      // 2. Validate GPS Coordinates (Haversine distance)
      const schoolCoords = dashboardConfig.schoolCoordinates;
      const effectiveLat = userLat ?? schoolCoords.latitude + (Math.random() * 0.0004 - 0.0002);
      const effectiveLng = userLng ?? schoolCoords.longitude + (Math.random() * 0.0004 - 0.0002);

      const distance = calculateHaversineDistance(
        effectiveLat,
        effectiveLng,
        schoolCoords.latitude,
        schoolCoords.longitude
      );

      const allowedRadius = dashboardConfig.allowedGpsRadiusMeters;
      if (distance > allowedRadius) {
        playErrorAttendanceTone();
        return {
          success: false,
          message: `Lokasi Anda berada di luar radius sekolah (${distance} meter). Maksimal toleransi: ${allowedRadius} meter.`,
          distanceMeters: distance,
        };
      }

      // 3. Check duplicate attendance for today
      const todayStr = new Date().toISOString().split('T')[0];
      const hasAttendedToday = attendanceRecords.some(
        (r) => r.studentId === student.id && r.timestamp.startsWith(todayStr)
      );

      if (hasAttendedToday) {
        playErrorAttendanceTone();
        return {
          success: false,
          message: `${student.name} sudah tercatat melakukan presensi hari ini.`,
          distanceMeters: distance,
        };
      }

      // 4. Determine status: before 07.15 is HADIR, after is TERLAMBAT
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isLate = hours > 7 || (hours === 7 && minutes > 15);
      const attendanceStatus = isLate ? 'TERLAMBAT' : 'HADIR';

      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        studentId: student.id,
        studentNisn: student.nisn,
        studentName: student.name,
        className: student.className,
        timestamp: timestampStr,
        status: attendanceStatus,
        distanceMeters: distance,
        latitude: effectiveLat,
        longitude: effectiveLng,
        method: 'QR_DYNAMIC',
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);

      // Trigger audio and visual event for Terminal HP 2 & Laptop Admin
      playSuccessAttendanceTone();
      setTerminalRecentScan({
        studentName: student.name,
        studentNisn: student.nisn,
        className: student.className,
        timestamp: timestampStr,
        distanceMeters: distance,
      });

      // Clear terminal alert after 3 seconds
      setTimeout(() => {
        setTerminalRecentScan(null);
      }, 3500);

      return {
        success: true,
        message: `Presensi ${attendanceStatus === 'HADIR' ? 'Tepat Waktu' : 'Terlambat'} berhasil diverifikasi.`,
        record: newRecord,
        distanceMeters: distance,
      };
    },
    [students, attendanceRecords, dashboardConfig]
  );

  // Pay SPP Bill
  const paySppBill = useCallback((billId: string, method: PaymentMethod) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const receiptNum = `KW/STD2/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${Math.floor(1000 + Math.random() * 9000)}`;

    setSppBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: 'PAID',
              paidAt: timestampStr,
              paymentMethod: method,
              receiptNumber: receiptNum,
            }
          : b
      )
    );
  }, []);

  // Create SPP Bill by Admin
  const createSppBill = useCallback((billData: Omit<SppBill, 'id'>) => {
    const newBill: SppBill = {
      ...billData,
      id: `inv-${Date.now()}`,
    };
    setSppBills((prev) => [newBill, ...prev]);
  }, []);

  // Add News Item
  const addNewsItem = useCallback((item: Omit<NewsItem, 'id' | 'publishedAt'>) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const newItem: NewsItem = {
      ...item,
      id: `news-${Date.now()}`,
      publishedAt: dateStr,
    };
    setNewsItems((prev) => [newItem, ...prev]);
  }, []);

  // Delete News Item
  const deleteNewsItem = useCallback((id: string) => {
    setNewsItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Send Chat Message
  const sendChatMessage = useCallback(
    (messageText: string, senderRole: 'admin' | 'student', targetStudentId?: string) => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const studentId = targetStudentId || selectedStudent.id;
      const student = students.find((s) => s.id === studentId) || selectedStudent;

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: senderRole === 'admin' ? 'admin' : student.id,
        senderRole,
        senderName: senderRole === 'admin' ? 'Petugas Tata Usaha' : student.name,
        receiverId: senderRole === 'admin' ? student.id : 'admin',
        message: messageText.trim(),
        timestamp: timestampStr,
        isRead: false,
      };

      setChatMessages((prev) => [...prev, newMsg]);
    },
    [selectedStudent, students]
  );

  // Student CRUD
  const addStudent = useCallback((data: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Teacher CRUD
  const addTeacher = useCallback((data: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...data,
      id: `tch-${Date.now()}`,
    };
    setTeachers((prev) => [...prev, newTeacher]);
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Schedule CRUD
  const addSchedule = useCallback((data: Omit<ScheduleItem, 'id'>) => {
    const newSchedule: ScheduleItem = {
      ...data,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, newSchedule]);
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      activeRole,
      setActiveRole,
      selectedStudent,
      setSelectedStudent,
      students,
      teachers,
      classes,
      schedules,
      attendanceRecords,
      sppBills,
      newsItems,
      chatMessages,
      dashboardConfig,
      qrToken,
      terminalRecentScan,
      refreshQrToken,
      updateDashboardConfig,
      login,
      logout,
      simulateAttendanceScan,
      paySppBill,
      createSppBill,
      addNewsItem,
      deleteNewsItem,
      sendChatMessage,
      addStudent,
      updateStudent,
      deleteStudent,
      addTeacher,
      deleteTeacher,
      addSchedule,
      deleteSchedule,
    }),
    [
      activeRole,
      selectedStudent,
      students,
      teachers,
      classes,
      schedules,
      attendanceRecords,
      sppBills,
      newsItems,
      chatMessages,
      dashboardConfig,
      qrToken,
      terminalRecentScan,
      refreshQrToken,
      updateDashboardConfig,
      login,
      logout,
      simulateAttendanceScan,
      paySppBill,
      createSppBill,
      addNewsItem,
      deleteNewsItem,
      sendChatMessage,
      addStudent,
      updateStudent,
      deleteStudent,
      addTeacher,
      deleteTeacher,
      addSchedule,
      deleteSchedule,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
