import * as Y from 'yjs';
import { Task, TaskUpdate } from '../types/Task';
import { CollaborativeState, SyncRequest, SyncResponse } from '../types/Collaborative';
import { retry, RetryOptions } from '../utils/retry';

export interface AuthenticatedFetchFunction {
  (url: string, options?: RequestInit): Promise<Response>;
}

export class CollaborativeService {
  private doc: Y.Doc;
  private tasks: Y.Array<Y.Map<any>>;
  private metadata: Y.Map<any>;
  private clientId: string;
  private baseUrl: string;
  private taskListId: string;
  private retryOptions: RetryOptions;
  private authenticatedFetch: AuthenticatedFetchFunction;

  constructor(
    taskListId: string, 
    authenticatedFetch: AuthenticatedFetchFunction,
    baseUrl: string = 'http://localhost:3001'
  ) {
    this.doc = new Y.Doc();
    this.tasks = this.doc.getArray('tasks');
    this.metadata = this.doc.getMap('metadata');
    this.clientId = this.generateClientId();
    this.baseUrl = baseUrl;
    this.taskListId = taskListId;
    this.retryOptions = { maxRetries: 3, delayMs: 1000, backoff: 'exponential' };
    this.authenticatedFetch = authenticatedFetch;
  }

  /**
   * クライアントIDを生成
   */
  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * タスクIDを生成（clientID-timestamp-random形式）
   */
  generateTaskId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.clientId}-${timestamp}-${random}`;
  }

  /**
   * Uint8ArrayをBase64文字列にエンコード
   */
  private encodeBase64(uint8Array: Uint8Array): string {
    return Buffer.from(uint8Array).toString('base64');
  }

  /**
   * Base64文字列をUint8Arrayにデコード
   */
  private decodeBase64(base64: string): Uint8Array {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }

  /**
   * 完全な状態を取得してローカルドキュメントに適用
   */
  async fetchFullState(): Promise<void> {
    await retry(async () => {
      const response = await this.authenticatedFetch(
        `${this.baseUrl}/api/task-lists/${this.taskListId}/collaborative/full-state`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const collaborativeState: CollaborativeState = data.data;

      // サーバーから受信した状態をローカルドキュメントに適用
      if (collaborativeState.state) {
        const state = this.decodeBase64(collaborativeState.state);
        Y.applyUpdate(this.doc, state);
      }
    }, this.retryOptions);
  }

  /**
   * 差分同期を実行
   */
  async sync(): Promise<void> {
    await retry(async () => {
      // 現在のstateVectorを取得
      const stateVector = Y.encodeStateVector(this.doc);
      const stateVectorBase64 = this.encodeBase64(stateVector);

      // ローカルの変更があるかチェック
      const localUpdate = Y.encodeStateAsUpdate(this.doc);
      const localUpdateBase64 = localUpdate.length > 0 ? this.encodeBase64(localUpdate) : undefined;

      const syncRequest: SyncRequest = {
        stateVector: stateVectorBase64,
        update: localUpdateBase64,
      };

      const response = await this.authenticatedFetch(
        `${this.baseUrl}/api/task-lists/${this.taskListId}/collaborative/sync`,
        {
          method: 'POST',
          body: JSON.stringify(syncRequest),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const syncResponse: SyncResponse = data.data;

      // サーバーからの更新を適用
      if (syncResponse.update) {
        const update = this.decodeBase64(syncResponse.update);
        Y.applyUpdate(this.doc, update);
      }
    }, this.retryOptions);
  }

  /**
   * タスクを追加
   */
  addTask(content: string, order?: number): string {
    const taskId = this.generateTaskId();
    const task = new Y.Map();
    const now = Date.now();

    this.doc.transact(() => {
      task.set('id', taskId);
      task.set('content', content);
      task.set('completed', false);
      task.set('order', order ?? this.tasks.length);
      task.set('createdAt', now);
      task.set('updatedAt', now);

      this.tasks.push([task]);
    });

    return taskId;
  }

  /**
   * タスクを更新
   */
  updateTask(taskId: string, updates: TaskUpdate): boolean {
    const taskIndex = this.tasks.toArray().findIndex(t => t.get('id') === taskId);
    
    if (taskIndex === -1) {
      return false;
    }

    const task = this.tasks.get(taskIndex);
    
    this.doc.transact(() => {
      Object.entries(updates).forEach(([key, value]) => {
        task.set(key, value);
      });
      task.set('updatedAt', Date.now());
    });

    return true;
  }

  /**
   * タスクを削除
   */
  deleteTask(taskId: string): boolean {
    const taskIndex = this.tasks.toArray().findIndex(t => t.get('id') === taskId);
    
    if (taskIndex === -1) {
      return false;
    }

    this.doc.transact(() => {
      this.tasks.delete(taskIndex, 1);
    });

    return true;
  }

  /**
   * 全タスクを取得
   */
  getTasks(): Task[] {
    return this.tasks.toArray().map(taskMap => {
      const task: Task = {
        id: taskMap.get('id'),
        content: taskMap.get('content'),
        completed: taskMap.get('completed'),
        order: taskMap.get('order'),
        createdAt: taskMap.get('createdAt'),
        updatedAt: taskMap.get('updatedAt'),
      };

      const dueDate = taskMap.get('dueDate');
      if (dueDate) {
        task.dueDate = dueDate;
      }

      return task;
    });
  }

  /**
   * ドキュメントのイベントリスナーを追加
   */
  onUpdate(callback: () => void): () => void {
    this.doc.on('update', callback);
    
    // リスナーを削除する関数を返す
    return () => {
      this.doc.off('update', callback);
    };
  }

  /**
   * リソースをクリーンアップ
   */
  destroy(): void {
    this.doc.destroy();
  }

  /**
   * Y.Docインスタンスを取得
   */
  getDoc(): Y.Doc {
    return this.doc;
  }
}