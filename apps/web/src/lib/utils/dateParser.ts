/**
 * テキストから日付を自動解析するユーティリティ
 */

export interface ParsedTask {
  content: string;
  dueDate: Date | null;
}

/**
 * タスクのテキストから日付を解析し、日付部分を除去したコンテンツと日付を返す
 */
export function parseTaskContent(content: string, language: string = 'ja'): ParsedTask {
  const trimmedContent = content.trim();
  
  if (language === 'ja') {
    return parseJapaneseDate(trimmedContent);
  } else {
    return parseEnglishDate(trimmedContent);
  }
}

/**
 * 日本語の日付表現を解析
 */
function parseJapaneseDate(content: string): ParsedTask {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 「今日」の解析
  const todayMatch = content.match(/^(今日)\s*/);
  if (todayMatch) {
    return {
      content: content.replace(todayMatch[0], '').trim(),
      dueDate: new Date(today),
    };
  }
  
  // 「明日」の解析
  const tomorrowMatch = content.match(/^(明日)\s*/);
  if (tomorrowMatch) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      content: content.replace(tomorrowMatch[0], '').trim(),
      dueDate: tomorrow,
    };
  }
  
  // 「あさって」の解析
  const dayAfterTomorrowMatch = content.match(/^(あさって|明後日)\s*/);
  if (dayAfterTomorrowMatch) {
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return {
      content: content.replace(dayAfterTomorrowMatch[0], '').trim(),
      dueDate: dayAfterTomorrow,
    };
  }
  
  // 曜日の解析（「月曜日」「火曜」など）
  const weekdayMatch = content.match(/^(月曜日?|火曜日?|水曜日?|木曜日?|金曜日?|土曜日?|日曜日?)\s*/);
  if (weekdayMatch) {
    const weekdays = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
    const targetDay = weekdayMatch[1].replace('日', '');
    const targetIndex = weekdays.findIndex(day => day === targetDay);
    
    if (targetIndex !== -1) {
      const currentDay = today.getDay();
      let daysToAdd = targetIndex - currentDay;
      
      // 今日より前の曜日の場合は来週
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      
      return {
        content: content.replace(weekdayMatch[0], '').trim(),
        dueDate: targetDate,
      };
    }
  }
  
  // 相対日付（「3日後」「1週間後」など）
  const relativeDayMatch = content.match(/^(\d+)日後\s*/);
  if (relativeDayMatch) {
    const days = parseInt(relativeDayMatch[1], 10);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    
    return {
      content: content.replace(relativeDayMatch[0], '').trim(),
      dueDate: targetDate,
    };
  }
  
  const relativeWeekMatch = content.match(/^(\d+)週間後\s*/);
  if (relativeWeekMatch) {
    const weeks = parseInt(relativeWeekMatch[1], 10);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + (weeks * 7));
    
    return {
      content: content.replace(relativeWeekMatch[0], '').trim(),
      dueDate: targetDate,
    };
  }
  
  // 絶対日付（「2025/06/18」「6/18」「6月18日」など）
  const absoluteDateMatch = content.match(/^(\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}\/\d{1,2}|\d{1,2}月\d{1,2}日)\s*/);
  if (absoluteDateMatch) {
    const dateStr = absoluteDateMatch[1];
    let parsedDate: Date | null = null;
    
    if (dateStr.includes('月') && dateStr.includes('日')) {
      // 「6月18日」形式
      const monthDayMatch = dateStr.match(/(\d{1,2})月(\d{1,2})日/);
      if (monthDayMatch) {
        const month = parseInt(monthDayMatch[1], 10) - 1; // 0ベース
        const day = parseInt(monthDayMatch[2], 10);
        parsedDate = new Date(today.getFullYear(), month, day);
        
        // 過去の日付の場合は来年
        if (parsedDate < today) {
          parsedDate.setFullYear(parsedDate.getFullYear() + 1);
        }
      }
    } else if (dateStr.match(/\d{4}\/\d{1,2}\/\d{1,2}/)) {
      // 「2025/06/18」形式
      const parts = dateStr.split('/');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0ベース
      const day = parseInt(parts[2], 10);
      parsedDate = new Date(year, month, day);
    } else if (dateStr.match(/\d{1,2}\/\d{1,2}/)) {
      // 「6/18」形式
      const parts = dateStr.split('/');
      const month = parseInt(parts[0], 10) - 1; // 0ベース
      const day = parseInt(parts[1], 10);
      parsedDate = new Date(today.getFullYear(), month, day);
      
      // 過去の日付の場合は来年
      if (parsedDate < today) {
        parsedDate.setFullYear(parsedDate.getFullYear() + 1);
      }
    }
    
    if (parsedDate) {
      return {
        content: content.replace(absoluteDateMatch[0], '').trim(),
        dueDate: parsedDate,
      };
    }
  }
  
  return {
    content,
    dueDate: null,
  };
}

/**
 * 英語の日付表現を解析
 */
function parseEnglishDate(content: string): ParsedTask {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 「today」の解析
  const todayMatch = content.match(/^(today)\s*/i);
  if (todayMatch) {
    return {
      content: content.replace(todayMatch[0], '').trim(),
      dueDate: new Date(today),
    };
  }
  
  // 「tomorrow」の解析
  const tomorrowMatch = content.match(/^(tomorrow)\s*/i);
  if (tomorrowMatch) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      content: content.replace(tomorrowMatch[0], '').trim(),
      dueDate: tomorrow,
    };
  }
  
  // 曜日の解析（「monday」「tue」など）
  const weekdayMatch = content.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*/i);
  if (weekdayMatch) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const shortWeekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    
    let targetIndex = -1;
    const dayStr = weekdayMatch[1].toLowerCase();
    
    // フルネームで検索
    targetIndex = weekdays.findIndex(day => day.startsWith(dayStr));
    
    // 短縮形で検索
    if (targetIndex === -1) {
      targetIndex = shortWeekdays.findIndex(day => day === dayStr);
    }
    
    if (targetIndex !== -1) {
      const currentDay = today.getDay();
      let daysToAdd = targetIndex - currentDay;
      
      // 今日より前の曜日の場合は来週
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      
      return {
        content: content.replace(weekdayMatch[0], '').trim(),
        dueDate: targetDate,
      };
    }
  }
  
  // 相対日付（「in 3 days」「3 days later」など）
  const relativeDayMatch = content.match(/^(in\s+)?(\d+)\s+(days?\s+(later|from\s+now)?|d)\s*/i);
  if (relativeDayMatch) {
    const days = parseInt(relativeDayMatch[2], 10);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    
    return {
      content: content.replace(relativeDayMatch[0], '').trim(),
      dueDate: targetDate,
    };
  }
  
  const relativeWeekMatch = content.match(/^(in\s+)?(\d+)\s+(weeks?\s+(later|from\s+now)?|w)\s*/i);
  if (relativeWeekMatch) {
    const weeks = parseInt(relativeWeekMatch[2], 10);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + (weeks * 7));
    
    return {
      content: content.replace(relativeWeekMatch[0], '').trim(),
      dueDate: targetDate,
    };
  }
  
  // 絶対日付（「2025/06/18」「6/18」「June 18」など）
  const absoluteDateMatch = content.match(/^(\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}-\d{1,2}|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2})\s*/i);
  if (absoluteDateMatch) {
    const dateStr = absoluteDateMatch[1];
    let parsedDate: Date | null = null;
    
    if (dateStr.match(/\d{4}\/\d{1,2}\/\d{1,2}/)) {
      // 「2025/06/18」形式
      const parts = dateStr.split('/');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0ベース
      const day = parseInt(parts[2], 10);
      parsedDate = new Date(year, month, day);
    } else if (dateStr.match(/\d{1,2}\/\d{1,2}/)) {
      // 「6/18」形式
      const parts = dateStr.split('/');
      const month = parseInt(parts[0], 10) - 1; // 0ベース
      const day = parseInt(parts[1], 10);
      parsedDate = new Date(today.getFullYear(), month, day);
      
      // 過去の日付の場合は来年
      if (parsedDate < today) {
        parsedDate.setFullYear(parsedDate.getFullYear() + 1);
      }
    } else if (dateStr.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
      // 「2025-06-18」形式
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0ベース
      const day = parseInt(parts[2], 10);
      parsedDate = new Date(year, month, day);
    } else {
      // 「June 18」形式
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthMatch = dateStr.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/i);
      if (monthMatch) {
        const monthStr = monthMatch[1].toLowerCase();
        const day = parseInt(monthMatch[2], 10);
        const monthIndex = monthNames.findIndex(month => month === monthStr);
        
        if (monthIndex !== -1) {
          parsedDate = new Date(today.getFullYear(), monthIndex, day);
          
          // 過去の日付の場合は来年
          if (parsedDate < today) {
            parsedDate.setFullYear(parsedDate.getFullYear() + 1);
          }
        }
      }
    }
    
    if (parsedDate) {
      return {
        content: content.replace(absoluteDateMatch[0], '').trim(),
        dueDate: parsedDate,
      };
    }
  }
  
  return {
    content,
    dueDate: null,
  };
}