import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  getProjects,
  addProject,
  getProject,
  updateProject,
  getProjectTasks,
  getProjectTeam,
  addProjectTask,
  updateProjectTask,
  deleteProjectTask,
  removeTeamMember,
  deleteProject
} from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.get("/", protect, getProjects);
projectRouter.post("/", protect, addProject);
projectRouter.get("/:id", protect, getProject);
projectRouter.put("/:id", protect, updateProject);
projectRouter.delete("/:id", protect, deleteProject);
projectRouter.get("/:id/tasks", protect, getProjectTasks);
projectRouter.get("/:id/team", protect, getProjectTeam);
projectRouter.delete("/:projectId/team/:userId", protect, removeTeamMember);
projectRouter.post("/:id/tasks", protect, addProjectTask);
projectRouter.put("/:projectId/tasks/:taskId", protect, updateProjectTask);
projectRouter.delete("/:projectId/tasks/:taskId", protect, deleteProjectTask);

export default projectRouter;
