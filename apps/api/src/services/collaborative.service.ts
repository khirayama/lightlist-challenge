import * as Y from "yjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface TaskData {
  id: string;
  content: string;
  completed: boolean;
  dueDate?: number; // Unix timestamp
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface CollaborativeState {
  state: string; // Base64 encoded Y.Doc state
  stateVector: string; // Base64 encoded state vector
}

export class CollaborativeService {
  private docs = new Map<string, Y.Doc>();

  // タスクリストのYjsドキュメントを取得または作成
  private async getOrCreateDoc(taskListId: string): Promise<Y.Doc> {
    // メモリ内のドキュメントがあればそれを返す
    if (this.docs.has(taskListId)) {
      return this.docs.get(taskListId)!;
    }

    // データベースから既存のドキュメント状態を取得
    const document = await prisma.taskListDocument.findUnique({
      where: { taskListId }
    });

    const doc = new Y.Doc();

    if (document) {
      // 既存のドキュメント状態を復元
      Y.applyUpdate(doc, Buffer.from(document.documentState));
    } else {
      // 新しいドキュメントを初期化
      await this.initializeDocument(doc, taskListId);
      await this.saveDocument(taskListId, doc);
    }

    this.docs.set(taskListId, doc);
    return doc;
  }

  // ドキュメントの初期化（既存のタスクをYjsドキュメントにロード）
  private async initializeDocument(doc: Y.Doc, taskListId: string): Promise<void> {
    const tasks = await prisma.task.findMany({
      where: { taskListId },
      orderBy: { order: 'asc' }
    });

    const yTasks = doc.getArray<Y.Map<any>>('tasks');
    const metadata = doc.getMap('metadata');

    // メタデータの設定
    metadata.set('taskListId', taskListId);
    metadata.set('lastModified', Date.now());

    // 既存のタスクをYjsドキュメントに追加
    doc.transact(() => {
      for (const task of tasks) {
        const yTask = new Y.Map();
        yTask.set('id', task.id);
        yTask.set('content', task.content);
        yTask.set('completed', task.completed);
        yTask.set('dueDate', task.dueDate ? task.dueDate.getTime() : undefined);
        yTask.set('order', task.order);
        yTask.set('createdAt', task.createdAt.getTime());
        yTask.set('updatedAt', task.updatedAt.getTime());
        
        yTasks.push([yTask]);
      }
    });
  }

  // ドキュメントをデータベースに保存
  private async saveDocument(taskListId: string, doc: Y.Doc): Promise<void> {
    const state = Y.encodeStateAsUpdate(doc);
    const stateVector = Y.encodeStateVector(doc);

    await prisma.taskListDocument.upsert({
      where: { taskListId },
      update: {
        stateVector: Buffer.from(stateVector),
        documentState: Buffer.from(state),
        updatedAt: new Date()
      },
      create: {
        taskListId,
        stateVector: Buffer.from(stateVector),
        documentState: Buffer.from(state)
      }
    });
  }

  // 完全な状態を取得
  async getFullState(taskListId: string, userId: string): Promise<CollaborativeState> {
    // アクセス権限チェック
    const taskList = await prisma.taskList.findUnique({
      where: { id: taskListId }
    });

    if (!taskList || taskList.userId !== userId) {
      throw new Error("Access denied");
    }

    const doc = await this.getOrCreateDoc(taskListId);
    const state = Y.encodeStateAsUpdate(doc);
    const stateVector = Y.encodeStateVector(doc);

    return {
      state: this.encodeBase64(state),
      stateVector: this.encodeBase64(stateVector)
    };
  }

  // 差分同期
  async sync(
    taskListId: string, 
    userId: string, 
    clientStateVector: string, 
    clientUpdate?: string
  ): Promise<{ update: string | null; stateVector: string }> {
    // アクセス権限チェック
    const taskList = await prisma.taskList.findUnique({
      where: { id: taskListId }
    });

    if (!taskList || taskList.userId !== userId) {
      throw new Error("Access denied");
    }

    const doc = await this.getOrCreateDoc(taskListId);

    // クライアントからの更新を適用
    if (clientUpdate) {
      const update = this.decodeBase64(clientUpdate);
      Y.applyUpdate(doc, update);
      
      // データベースに保存
      await this.saveDocument(taskListId, doc);
      
      // オプション: 更新履歴を保存
      await this.saveUpdate(taskListId, userId, update);
    }

    // クライアントに送信する差分を計算
    const clientVector = this.decodeBase64(clientStateVector);
    const serverUpdate = Y.encodeStateAsUpdate(doc, clientVector);
    const newStateVector = Y.encodeStateVector(doc);

    return {
      update: serverUpdate.length > 0 ? this.encodeBase64(serverUpdate) : null,
      stateVector: this.encodeBase64(newStateVector)
    };
  }

  // 更新履歴を保存（オプション）
  private async saveUpdate(taskListId: string, userId: string, update: Uint8Array): Promise<void> {
    await prisma.taskListUpdate.create({
      data: {
        taskListId,
        userId,
        update: Buffer.from(update)
      }
    });
  }

  // Base64エンコード
  private encodeBase64(data: Uint8Array): string {
    return Buffer.from(data).toString('base64');
  }

  // Base64デコード
  private decodeBase64(data: string): Uint8Array {
    return new Uint8Array(Buffer.from(data, 'base64'));
  }

  // メモリクリーンアップ（必要に応じて呼び出し）
  clearDocumentCache(taskListId?: string): void {
    if (taskListId) {
      this.docs.delete(taskListId);
    } else {
      this.docs.clear();
    }
  }

  // ドキュメントからタスクデータを抽出（デバッグ用）
  async getTasksFromDocument(taskListId: string, _userId: string): Promise<TaskData[]> {
    const doc = await this.getOrCreateDoc(taskListId);
    const yTasks = doc.getArray<Y.Map<any>>('tasks');
    
    const tasks: TaskData[] = [];
    yTasks.forEach(yTask => {
      tasks.push({
        id: yTask.get('id'),
        content: yTask.get('content'),
        completed: yTask.get('completed'),
        dueDate: yTask.get('dueDate'),
        order: yTask.get('order'),
        createdAt: yTask.get('createdAt'),
        updatedAt: yTask.get('updatedAt')
      });
    });

    return tasks.sort((a, b) => a.order - b.order);
  }
}