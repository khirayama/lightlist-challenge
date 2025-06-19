import { Router } from "express";
import { TaskListController } from "../controllers/task-list.controller.js";
import { CollaborativeController } from "../controllers/collaborative.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();
const taskListController = new TaskListController();
const collaborativeController = new CollaborativeController();

// 認証が必要な全ルートに適用
router.use(authenticateToken);

// GET /api/task-lists - タスクリスト一覧取得
router.get("/", async (req, res) => {
  await taskListController.getTaskLists(req, res);
});

// POST /api/task-lists - タスクリスト作成
router.post("/", async (req, res) => {
  await taskListController.createTaskList(req, res);
});

// PUT /api/task-lists/:taskListId - タスクリスト更新
router.put("/:taskListId", async (req, res) => {
  await taskListController.updateTaskList(req, res);
});

// DELETE /api/task-lists/:taskListId - タスクリスト削除
router.delete("/:taskListId", async (req, res) => {
  await taskListController.deleteTaskList(req, res);
});

// GET /api/task-lists/:taskListId/collaborative/full-state - 完全な状態取得
router.get("/:taskListId/collaborative/full-state", async (req, res) => {
  await collaborativeController.getFullState(req, res);
});

// POST /api/task-lists/:taskListId/collaborative/sync - 差分同期
router.post("/:taskListId/collaborative/sync", async (req, res) => {
  await collaborativeController.sync(req, res);
});

// GET /api/task-lists/:taskListId/collaborative/tasks - デバッグ用タスク取得
router.get("/:taskListId/collaborative/tasks", async (req, res) => {
  await collaborativeController.getTasks(req, res);
});

export default router;