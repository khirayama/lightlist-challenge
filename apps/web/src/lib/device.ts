/**
 * ブラウザ用デバイス識別ユーティリティ
 * ユーザーのブラウザ・デバイスを識別するためのIDとフレンドリーな名前を生成
 */

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
}

/**
 * ブラウザフィンガープリントを基にしたデバイスIDを生成
 */
function generateBrowserFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ].join('|');
  
  return btoa(fingerprint).replace(/[+/=]/g, '').substring(0, 32);
}

/**
 * ユーザーエージェントから分かりやすいデバイス名を生成
 */
function generateDeviceName(): string {
  const ua = navigator.userAgent;
  
  // ブラウザの検出
  let browser = 'Unknown Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  }
  
  // OSの検出
  let os = 'Unknown OS';
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('iPhone')) {
    os = 'iPhone';
  } else if (ua.includes('iPad')) {
    os = 'iPad';
  } else if (ua.includes('Android')) {
    os = 'Android';
  }
  
  return `${browser} on ${os}`;
}

/**
 * デバイス情報を取得（キャッシュ機能付き）
 */
export function getDeviceInfo(): DeviceInfo {
  const STORAGE_KEY = 'hobby-baseline-device-id';
  
  // 既存のデバイスIDをlocalStorageから取得
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.deviceId && parsed.deviceName) {
        return parsed;
      }
    } catch {
      // パースエラーの場合は新規生成
    }
  }
  
  // 新しいデバイス情報を生成
  const deviceInfo: DeviceInfo = {
    deviceId: generateBrowserFingerprint(),
    deviceName: generateDeviceName(),
  };
  
  // localStorage に保存
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deviceInfo));
  
  return deviceInfo;
}