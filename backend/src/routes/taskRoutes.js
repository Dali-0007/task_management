const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const {
  list,
  summary,
  getById,
  create,
  update,
  remove,
  listComments,
  addComment,
} = require("../controllers/taskController");

// Role and project-membership rules are enforced in taskService, because
// they depend on the task's project rather than on the route alone.
const router = express.Router();

router.use(authenticateUser);

router.get("/", list);
router.get("/summary", summary);
router.post("/", create);
router.get("/:id", getById);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id/comments", listComments);
router.post("/:id/comments", addComment);

module.exports = router;
