import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();
const taskController = new TaskController();

// 認証が必要な全ルートに適用
router.use(authenticateToken);

// GET /api/task-lists/:taskListId/tasks - タスク一覧取得
router.get("/task-lists/:taskListId/tasks", async (req, res) => {
  await taskController.getTasks(req, res);
});

// POST /api/task-lists/:taskListId/tasks - タスク作成
router.post("/task-lists/:taskListId/tasks", async (req, res) => {
  await taskController.createTask(req, res);
});

// PUT /api/tasks/:taskId - タスク更新
router.put("/tasks/:taskId", async (req, res) => {
  await taskController.updateTask(req, res);
});

// DELETE /api/tasks/:taskId - タスク削除
router.delete("/tasks/:taskId", async (req, res) => {
  await taskController.deleteTask(req, res);
});

export default router;