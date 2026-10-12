
const {
  listProjectMembers,
  listAvailableUsers,
  addProjectMember,
  removeProjectMember,
} = require("../services/projectMemberService");

async function listMembers(req, res) {
  try {
    const projectId = req.params.id;

    if (!/^[1-9]\d*$/.test(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const members = await listProjectMembers(
      projectId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Member listing failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve project members.",
    });
  }
}

async function listAvailable(req, res) {
  try {
    const projectId = req.params.id;
    const search = String(req.query.search || "").trim();

    if (!/^[1-9]\d*$/.test(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    if (search.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search must contain at least 2 characters.",
      });
    }

    const users = await listAvailableUsers(
      projectId,
      search,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Available user search failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to search available users.",
    });
  }
}

async function addMember(req, res) {
  try {
    const projectId = req.params.id;
    const { userId } = req.body;

    if (!/^[1-9]\d*$/.test(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    if (
      userId === undefined ||
      !/^[1-9]\d*$/.test(String(userId))
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid userId is required.",
      });
    }

    const member = await addProjectMember({
      projectId,
      userId: String(userId),
      managerId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Project member added successfully.",
      member,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Adding project member failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add project member.",
    });
  }
}

async function removeMember(req, res) {
  try {
    const { id: projectId, userId } = req.params;

    if (
      !/^[1-9]\d*$/.test(projectId) ||
      !/^[1-9]\d*$/.test(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or user ID.",
      });
    }

    await removeProjectMember({
      projectId,
      userId,
      managerId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Project member removed successfully.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Removing project member failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove project member.",
    });
  }
}

module.exports = {
  listMembers,
  listAvailable,
  addMember,
  removeMember,
};
