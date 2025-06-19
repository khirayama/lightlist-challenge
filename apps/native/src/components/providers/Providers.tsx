import React from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { CollaborativeProvider } from '../../contexts/CollaborativeContext';

interface ProvidersProps {
  children: React.ReactNode;
  taskListId?: string;
  enableCollaborative?: boolean;
}

export function Providers({ children, taskListId, enableCollaborative = false }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          {enableCollaborative && taskListId ? (
            <CollaborativeProvider taskListId={taskListId}>
              {children}
            </CollaborativeProvider>
          ) : (
            children
          )}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}