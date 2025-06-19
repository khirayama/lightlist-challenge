/**
 * React Native用デバイス識別ユーティリティ
 * ネイティブアプリのデバイスを識別するためのIDとフレンドリーな名前を生成
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
}

/**
 * ランダムなデバイスIDを生成
 */
function generateRandomDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${Platform.OS}-${timestamp}-${randomPart}`;
}

/**
 * プラットフォーム情報から分かりやすいデバイス名を生成
 */
function generateDeviceName(): string {
  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const version = Platform.Version;
  
  if (Platform.OS === 'ios') {
    return `iPhone (iOS ${version})`;
  } else {
    return `Android (API ${version})`;
  }
}

/**
 * デバイス情報を取得（キャッシュ機能付き）
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const STORAGE_KEY = 'hobby-baseline-device-id';
  
  try {
    // 既存のデバイスIDをAsyncStorageから取得
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.deviceId && parsed.deviceName) {
        return parsed;
      }
    }
  } catch {
    // パースエラーの場合は新規生成
  }
  
  // 新しいデバイス情報を生成
  const deviceInfo: DeviceInfo = {
    deviceId: generateRandomDeviceId(),
    deviceName: generateDeviceName(),
  };
  
  // AsyncStorage に保存
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deviceInfo));
  } catch {
    // 保存エラーは無視（オフライン等）
  }
  
  return deviceInfo;
}