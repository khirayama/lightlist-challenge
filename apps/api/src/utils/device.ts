import crypto from "crypto";

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
}

/**
 * User-Agentから分かりやすいデバイス名を生成
 */
function generateDeviceNameFromUserAgent(userAgent: string): string {
  if (!userAgent) {
    return 'Unknown Device';
  }

  // ブラウザの検出
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  }
  
  // OSの検出
  let os = 'Unknown OS';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('iPhone')) {
    os = 'iPhone';
  } else if (userAgent.includes('iPad')) {
    os = 'iPad';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  }
  
  return `${browser} on ${os}`;
}

/**
 * IPアドレスとUser-Agentを組み合わせてデバイスIDを生成
 */
function generateDeviceIdFromRequest(userAgent: string, ipAddress: string): string {
  const deviceString = `${userAgent}|${ipAddress}`;
  
  // SHA-256ハッシュを生成
  const hash = crypto.createHash('sha256').update(deviceString).digest('hex');
  
  // 最初の16文字を使用してデバイスIDとする
  return hash.substring(0, 16);
}

/**
 * HTTPリクエストからデバイス情報を生成
 */
export function generateDeviceInfoFromRequest(userAgent: string, ipAddress: string): DeviceInfo {
  const deviceId = generateDeviceIdFromRequest(userAgent, ipAddress);
  const deviceName = generateDeviceNameFromUserAgent(userAgent);
  
  return {
    deviceId,
    deviceName,
  };
}