
const {
  createProject,
  listProjects,
  getProjectById,
  updateProjectById,
  archiveProjectById,
} = require("../services/projectService");

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

async function list(req, res) {
  try {
    const projects = await listProjects(req.user.id);

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Project listing failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve projects.",
    });
  }
}

async function getById(req, res) {
  try {
    const projectId = req.params.id;

    if (!/^[1-9]\d*$/.test(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await getProjectById(projectId, req.user.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Project retrieval failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve project.",
    });
  }
}

async function update(req, res) {
  try {
    const projectId = req.params.id;
    const { name, description = "" } = req.body;

    if (!/^[1-9]\d*$/.test(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

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

    const project = await updateProjectById({
      projectId,
      userId: req.user.id,
      name: name.trim(),
      description: description.trim() || null,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    console.error("Project update failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update project.",
    });
  }
}

async function archive(req, res) {
  try {
    const projectId = req.params.id;

    if (!/^[1-9]\d*$/.test(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await archiveProjectById({
      projectId,
      userId: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Active project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project archived successfully.",
      project,
    });
  } catch (error) {
    console.error("Project archiving failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to archive project.",
    });
  }
}
module.exports = { create, list, getById, update, archive };
