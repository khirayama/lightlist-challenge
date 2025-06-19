import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  isOpen: boolean;
  triggerRef?: React.RefObject<HTMLElement>;
}

// プリセットカラー（8色）
const PRESET_COLORS = [
  '#FFFFFF', // White
  '#FFE4E1', // Light Pink
  '#E6E6FA', // Lavender
  '#E0F6FF', // Light Blue
  '#E6FFE6', // Light Green
  '#FFF2CC', // Light Yellow
  '#FFE6CC', // Light Orange
  '#F0F0F0', // Light Gray
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onClose,
  isOpen,
  triggerRef,
}) => {
  const { t } = useTranslation('common');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // ポジション計算
  useEffect(() => {
    if (isOpen && triggerRef?.current && colorPickerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const pickerRect = colorPickerRef.current.getBoundingClientRect();
      
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
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node) &&
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

  return (
    <div
      ref={colorPickerRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="dialog"
      aria-label={t('colorPicker.title')}
    >
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {t('colorPicker.title')}
        </h3>
      </div>
      
      {/* プリセットカラー */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              value === color
                ? 'border-blue-500 dark:border-blue-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`${t('colorPicker.selectColor')} ${color}`}
          >
            {value === color && (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* カスタムカラー入力 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <label
          htmlFor="custom-color"
          className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t('colorPicker.customColor')}
        </label>
        <div className="flex gap-2">
          <input
            id="custom-color"
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="#FFFFFF"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );
};