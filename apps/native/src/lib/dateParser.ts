// 自然言語の日付表現を解析してDateオブジェクトに変換する
export interface ParseResult {
  content: string;    // 日付表現を除いたタスク内容
  dueDate: Date | null;  // 解析された日付（なければnull）
}

export function parseDateFromText(text: string, locale: string = 'ja'): ParseResult {
  const trimmedText = text.trim();
  
  // 日本語の日付表現
  const japanesePatterns = [
    { pattern: /^今日[\s　]*(.*)$/, days: 0 },
    { pattern: /^きょう[\s　]*(.*)$/, days: 0 },
    { pattern: /^明日[\s　]*(.*)$/, days: 1 },
    { pattern: /^あした[\s　]*(.*)$/, days: 1 },
    { pattern: /^あす[\s　]*(.*)$/, days: 1 },
    { pattern: /^明後日[\s　]*(.*)$/, days: 2 },
    { pattern: /^あさって[\s　]*(.*)$/, days: 2 },
    { pattern: /^月曜日?[\s　]*(.*)$/, weekday: 1 },
    { pattern: /^火曜日?[\s　]*(.*)$/, weekday: 2 },
    { pattern: /^水曜日?[\s　]*(.*)$/, weekday: 3 },
    { pattern: /^木曜日?[\s　]*(.*)$/, weekday: 4 },
    { pattern: /^金曜日?[\s　]*(.*)$/, weekday: 5 },
    { pattern: /^土曜日?[\s　]*(.*)$/, weekday: 6 },
    { pattern: /^日曜日?[\s　]*(.*)$/, weekday: 0 },
  ];

  // 英語の日付表現
  const englishPatterns = [
    { pattern: /^today[\s]*(.*)$/i, days: 0 },
    { pattern: /^tomorrow[\s]*(.*)$/i, days: 1 },
    { pattern: /^monday[\s]*(.*)$/i, weekday: 1 },
    { pattern: /^tuesday[\s]*(.*)$/i, weekday: 2 },
    { pattern: /^wednesday[\s]*(.*)$/i, weekday: 3 },
    { pattern: /^thursday[\s]*(.*)$/i, weekday: 4 },
    { pattern: /^friday[\s]*(.*)$/i, weekday: 5 },
    { pattern: /^saturday[\s]*(.*)$/i, weekday: 6 },
    { pattern: /^sunday[\s]*(.*)$/i, weekday: 0 },
  ];

  // 数値形式の日付表現（両言語共通）
  const dateFormats = [
    // YYYY/MM/DD, YYYY-MM-DD
    { pattern: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})[\s　]*(.*)$/ },
    // MM/DD, MM-DD (今年)
    { pattern: /^(\d{1,2})[\/\-](\d{1,2})[\s　]*(.*)$/ },
    // DD日 (今月)
    { pattern: /^(\d{1,2})日[\s　]*(.*)$/ },
  ];

  const patterns = locale === 'ja' ? japanesePatterns : englishPatterns;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 自然言語パターンをチェック
  for (const { pattern, days, weekday } of patterns) {
    const match = trimmedText.match(pattern);
    if (match) {
      const content = match[1].trim();
      let dueDate: Date;

      if (days !== undefined) {
        // 相対日付（今日、明日など）
        dueDate = new Date(today);
        dueDate.setDate(today.getDate() + days);
      } else if (weekday !== undefined) {
        // 曜日指定
        dueDate = new Date(today);
        const currentWeekday = today.getDay();
        let daysUntil = weekday - currentWeekday;
        if (daysUntil <= 0) {
          daysUntil += 7; // 来週の同じ曜日
        }
        dueDate.setDate(today.getDate() + daysUntil);
      }

      return { content, dueDate: dueDate! };
    }
  }

  // 数値形式の日付をチェック
  for (const { pattern } of dateFormats) {
    const match = trimmedText.match(pattern);
    if (match) {
      try {
        let year: number, month: number, day: number;
        let content: string;

        if (match.length === 5) {
          // YYYY/MM/DD 形式
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1; // Dateオブジェクトは0ベース
          day = parseInt(match[3]);
          content = match[4].trim();
        } else if (match.length === 4) {
          // MM/DD 形式（今年）
          year = today.getFullYear();
          month = parseInt(match[1]) - 1;
          day = parseInt(match[2]);
          content = match[3].trim();
        } else {
          // DD日 形式（今月）
          year = today.getFullYear();
          month = today.getMonth();
          day = parseInt(match[1]);
          content = match[2].trim();
        }

        const dueDate = new Date(year, month, day);
        
        // 有効な日付かチェック
        if (dueDate.getTime() && !isNaN(dueDate.getTime())) {
          return { content, dueDate };
        }
      } catch (error) {
        // 無効な日付の場合は続行
        continue;
      }
    }
  }

  // 日付表現が見つからない場合
  return { content: trimmedText, dueDate: null };
}

// 日付を人間が読みやすい形式でフォーマット
export function formatDueDate(date: Date, locale: string = 'ja'): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (locale === 'ja') {
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays === 2) return '明後日';
    if (diffDays === -1) return '昨日';
    
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    if (diffDays > 0 && diffDays <= 7) {
      return `${weekdays[date.getDay()]}曜日`;
    }
    
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } else {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (diffDays > 0 && diffDays <= 7) {
      return weekdays[date.getDay()];
    }
    
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}