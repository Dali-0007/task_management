const taskService = require("../services/taskService");
const {
  requireId,
  validateCreateTask,
  validateUpdateTask,
  validateTaskQuery,
  validateComment,
} = require("../validation/taskValidation");
const { sendError } = require("../utils/httpError");

async function list(req, res) {
  try {
    const filters = validateTaskQuery(req.query);
    const { tasks, total } = await taskService.listTasks(req.user, filters);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      tasks,
    });
  } catch (error) {
    return sendError(res, error, "Unable to retrieve tasks.", "Task listing failed");
  }
}

async function summary(req, res) {
  try {
    const data = await taskService.getSummary(req.user);

    return res.status(200).json({ success: true, summary: data });
  } catch (error) {
    return sendError(res, error, "Unable to load the task summary.", "Task summary failed");
  }
}

async function getById(req, res) {
  try {
    const taskId = requireId(req.params.id, "task ID");
    const task = await taskService.getTask(req.user, taskId);

    return res.status(200).json({ success: true, task });
  } catch (error) {
    return sendError(res, error, "Unable to retrieve task.", "Task retrieval failed");
  }
}

async function create(req, res) {
  try {
    const data = validateCreateTask(req.body);
    const task = await taskService.createTask(req.user, data);

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    return sendError(res, error, "Unable to create task.", "Task creation failed");
  }
}

async function update(req, res) {
  try {
    const taskId = requireId(req.params.id, "task ID");
    const changes = validateUpdateTask(req.body);
    const task = await taskService.updateTask(req.user, taskId, changes);

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    return sendError(res, error, "Unable to update task.", "Task update failed");
  }
}

async function remove(req, res) {
  try {
    const taskId = requireId(req.params.id, "task ID");
    await taskService.deleteTask(req.user, taskId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error, "Unable to delete task.", "Task deletion failed");
  }
}

async function listComments(req, res) {
  try {
    const taskId = requireId(req.params.id, "task ID");
    const comments = await taskService.listComments(req.user, taskId);

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    return sendError(res, error, "Unable to retrieve comments.", "Comment listing failed");
  }
}

async function addComment(req, res) {
  try {
    const taskId = requireId(req.params.id, "task ID");
    const content = validateComment(req.body);
    const comment = await taskService.addComment(req.user, taskId, content);

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment,
    });
  } catch (error) {
    return sendError(res, error, "Unable to add comment.", "Adding comment failed");
  }
}

module.exports = {
  list,
  summary,
  getById,
  create,
  update,
  remove,
  listComments,
  addComment,
};
