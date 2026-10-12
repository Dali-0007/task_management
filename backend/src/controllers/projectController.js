
const { createProject } = require("../services/projectService");

async function create(req, res) {
  try {
    const { name, description = "" } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
      });
    }

    if (name.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Project name cannot exceed 150 characters.",
      });
    }

    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string.",
      });
    }

    const project = await createProject({
      name: name.trim(),
      description: description.trim() || null,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    console.error("Project creation failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create project.",
    });
  }
}

module.exports = { create };
