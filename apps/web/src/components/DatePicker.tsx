import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onClose?: () => void;
  isOpen: boolean;
  triggerRef?: React.RefObject<HTMLElement>;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  onClose,
  isOpen,
  triggerRef,
}) => {
  const { t, i18n } = useTranslation('common');
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // ポジション計算
  useEffect(() => {
    if (isOpen && triggerRef?.current && datePickerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const pickerRect = datePickerRef.current.getBoundingClientRect();
      
      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // 画面外に出る場合の調整
      if (left + pickerRect.width > window.innerWidth) {
        left = triggerRect.right - pickerRect.width;
      }
      
      if (top + pickerRect.height > window.innerHeight) {
        top = triggerRect.top - pickerRect.height - 8;
      }

      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // Escapeキーで閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // カレンダーの日付生成
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDay.getDay(); // 0 = Sunday
    
    const days: (Date | null)[] = [];
    
    // 前月の日付で埋める
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }
    
    // 当月の日付
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString(i18n.language, { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const isSameDate = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getTime() === date2.getTime();
  };

  const handleDateClick = (date: Date) => {
    onChange(date);
    onClose?.();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onChange(today);
    onClose?.();
  };

  const handleClearDate = () => {
    onChange(null);
    onClose?.();
  };

  // 曜日の表示
  const weekdays = i18n.language === 'ja' 
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      ref={datePickerRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="dialog"
      aria-label={t('datePicker.title')}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={t('datePicker.prevMonth')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatMonth(currentMonth)}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={t('datePicker.nextMonth')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((date, index) => (
          <button
            key={index}
            onClick={() => date && handleDateClick(date)}
            disabled={!date}
            className={`h-8 w-8 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !date
                ? 'invisible'
                : isSameDate(date, value)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : isSameDate(date, today)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {date?.getDate()}
          </button>
        ))}
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2 border-t border-gray-200 dark:border-gray-700 pt-3">
        <button
          onClick={handleToday}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {t('datePicker.today')}
        </button>
        {value && (
          <button
            onClick={handleClearDate}
            className="flex-1 px-3 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
          >
            {t('datePicker.clear')}
          </button>
        )}
      </div>
    </div>
  );
};