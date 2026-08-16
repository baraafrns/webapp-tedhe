import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UniversalLogin } from './components/auth/UniversalLogin';
import { AdminView } from './components/admin/AdminView';
import { StudentView } from './components/student/StudentView';
import { TerminalView } from './components/terminal/TerminalView';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { activeRole } = useApp();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col selection:bg-[#FFDA1A] selection:text-[#111111]">
      <AnimatePresence mode="wait">
        {!activeRole && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <UniversalLogin />
          </motion.div>
        )}

        {activeRole === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <AdminView />
          </motion.div>
        )}

        {activeRole === 'student' && (
          <motion.div
            key="student"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="w-full py-4 px-2"
          >
            <StudentView />
          </motion.div>
        )}

        {activeRole === 'terminal' && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <TerminalView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
