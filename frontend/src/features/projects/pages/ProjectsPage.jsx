
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import Autorenew from "@mui/icons-material/Autorenew";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import ManageMembersDialog from "../../../components/projects/ManageMembersDialog";
import { useAuth } from "../../auth/context/AuthContext";
import useProjects from "../hooks/useProjects";
import {
  cardActionsSx,
  cardMetaSx,
  cardSx,
  cardTitleSx,
  detailRowSx,
  emptyStateSx,
  eyebrowSx,
  filterFieldSx,
  headerButtonSx,
  pageHeaderSx,
  pageSubtitleSx,
  pageTitleSx,
  statCardSx,
  statIconSx,
  statLabelSx,
  statValueSx,
} from "../../../styles/commonStyles";

const emptyForm = { name: "", description: "" };

function ProjectsContent({ role }) {
  const {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    archiveProject,
  } = useProjects();

  const { user } = useAuth();
  const isManager = role === "PROJECT_MANAGER";

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailsProject, setDetailsProject] = useState(null);
  const [membersProject, setMembersProject] = useState(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [membersChanged, setMembersChanged] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredProjects = projects.filter(
    (project) =>
      statusFilter === "ALL" || project.status === statusFilter
  );

  function openCreateDialog() {
    setEditingProject(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  }

  function openEditDialog(project) {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || "",
    });
    setFormError("");
    setDialogOpen(true);
  }

  function openMembersDialog(project) {
    setDetailsProject(null);
    setMembersProject(project);
    setMembersDialogOpen(true);
  }

  function closeMembersDialog() {
    setMembersDialogOpen(false);

    if (membersChanged) {
      setMembersChanged(false);
      // Errors are surfaced through the hook's `error` state.
      loadProjects({ silent: true }).catch(() => {});
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (!payload.name) {
        setFormError("Project name is required.");
        return;
      }

      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingProject(null);
      setActionError("");
    } catch (saveError) {
      setFormError(
        saveError.response?.data?.message ||
          "Unable to save the project. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    if (!archiveTarget) return;

    setIsSaving(true);
    setActionError("");

    try {
      await archiveProject(archiveTarget.id);
      setArchiveTarget(null);

      if (detailsProject?.id === archiveTarget.id) {
        setDetailsProject(null);
      }
    } catch (archiveError) {
      setActionError(
        archiveError.response?.data?.message ||
          "Unable to archive the project."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const stats = [
    {
      label: "Total projects",
      value: projects.length,
      icon: FolderOutlined,
      tone: "indigo",
    },
    {
      label: "Active",
      value: projects.filter((project) => project.status === "ACTIVE").length,
      icon: Autorenew,
      tone: "green",
    },
    {
      label: "Archived",
      value: projects.filter((project) => project.status === "ARCHIVED").length,
      icon: Inventory2Outlined,
      tone: "gray",
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-end" }}
        sx={pageHeaderSx}
      >
        <Box>
          <Typography sx={eyebrowSx}>Workspace</Typography>
          <Typography component="h1" sx={pageTitleSx}>
            Projects
          </Typography>
          <Typography sx={pageSubtitleSx}>
            View and manage your team's projects.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadProjects().catch(() => {})}
            disabled={isLoading}
            sx={headerButtonSx}
          >
            Refresh
          </Button>

          {isManager && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={headerButtonSx}
            >
              New Project
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Paper key={label} variant="outlined" sx={statCardSx}>
            <Box>
              <Typography sx={statLabelSx}>{label}</Typography>
              <Typography sx={statValueSx}>{value}</Typography>
            </Box>
            <Box sx={statIconSx[tone]}>
              <Icon fontSize="small" />
            </Box>
          </Paper>
        ))}
      </Stack>

      <TextField
        select
        label="Project status"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        sx={{ mb: 3, ...filterFieldSx }}
        size="small"
      >
        <MenuItem value="ALL">All projects</MenuItem>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="ARCHIVED">Archived</MenuItem>
      </TextField>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" onClick={() => loadProjects().catch(() => {})}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert
          severity="error"
          onClose={() => setActionError("")}
          sx={{ mb: 2 }}
        >
          {actionError}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Paper variant="outlined" sx={emptyStateSx}>
          <Box sx={{ ...statIconSx.indigo, mx: "auto", mb: 2 }}>
            <FolderOutlined />
          </Box>
          <Typography variant="h6">No projects found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter === "ALL"
              ? "You haven't been added to any projects yet."
              : `There are no ${statusFilter.toLowerCase()} projects.`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredProjects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Paper variant="outlined" sx={cardSx}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Typography component="h3" sx={cardTitleSx}>
                    <Link
                      component={RouterLink}
                      to={`/dashboard/projects/${project.id}/tasks`}
                      color="inherit"
                      underline="hover"
                    >
                      {project.name}
                    </Link>
                  </Typography>
                  <Chip
                    size="small"
                    label={project.status}
                    color={
                      project.status === "ACTIVE" ? "success" : "default"
                    }
                  />
                </Stack>

                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    minHeight: 44,
                    lineHeight: 1.6,
                  }}
                >
                  {project.description || "No description provided."}
                </Typography>

                <Stack direction="row" spacing={2.5} flexWrap="wrap">
                  <Box sx={cardMetaSx}>
                    <GroupsOutlined />
                    Members: {project.member_count ?? 0}
                  </Box>

                  <Box sx={cardMetaSx}>
                    <CalendarMonthOutlined />
                    Created{" "}
                    {project.created_at
                      ? new Date(project.created_at).toLocaleDateString()
                      : "—"}
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1}
                  sx={cardActionsSx}
                >
                  <Button
                    size="small"
                    onClick={() => setDetailsProject(project)}
                  >
                    View details
                  </Button>

                  <Button
                    size="small"
                    startIcon={<GroupsOutlined />}
                    onClick={() => openMembersDialog(project)}
                  >
                    Manage Members
                  </Button>

                  {isManager && project.status === "ACTIVE" && (
                    <>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(project)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<ArchiveIcon />}
                        onClick={() => setArchiveTarget(project)}
                        sx={{ ml: "auto" }}
                      >
                        Archive
                      </Button>
                    </>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create and edit project dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !isSaving && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle>
            {editingProject ? "Edit project" : "Create project"}
          </DialogTitle>

          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}

            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Project name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
                slotProps={{ htmlInput: { maxLength: 150 } }}
                fullWidth
                autoFocus
              />

              <TextField
                label="Description"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save project"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Project details dialog */}
      <Dialog
        open={Boolean(detailsProject)}
        onClose={() => setDetailsProject(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Project details</DialogTitle>
        <DialogContent>
          {detailsProject && (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Typography sx={{ ...cardTitleSx, fontSize: 18 }}>
                  {detailsProject.name}
                </Typography>
                <Chip
                  label={detailsProject.status}
                  color={
                    detailsProject.status === "ACTIVE" ? "success" : "default"
                  }
                  size="small"
                />
              </Stack>

              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {detailsProject.description || "No description provided."}
              </Typography>

              <Box>
                <Box sx={detailRowSx}>
                  <span>Project ID</span>
                  <span>{detailsProject.id}</span>
                </Box>
                <Box sx={detailRowSx}>
                  <span>Members</span>
                  <span>{detailsProject.member_count ?? 0}</span>
                </Box>
                <Box sx={detailRowSx}>
                  <span>Created by user ID</span>
                  <span>{detailsProject.created_by}</span>
                </Box>
                <Box sx={detailRowSx}>
                  <span>Last updated</span>
                  <span>
                    {detailsProject.updated_at
                      ? new Date(detailsProject.updated_at).toLocaleString()
                      : "—"}
                  </span>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsProject(null)}>Close</Button>
          {detailsProject && (
            <Button
              variant="contained"
              component={RouterLink}
              to={`/dashboard/projects/${detailsProject.id}/tasks`}
            >
              View tasks
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Project membership dialog */}
      <ManageMembersDialog
        open={membersDialogOpen}
        onClose={closeMembersDialog}
        onMembersChanged={() => setMembersChanged(true)}
        project={membersProject}
        role={role}
        currentUserId={user?.id}
      />

      {/* Archive confirmation dialog */}
      <Dialog
        open={Boolean(archiveTarget)}
        onClose={() => !isSaving && setArchiveTarget(null)}
        maxWidth="xs"
      >
        <DialogTitle>Archive project?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Are you sure you want to archive{" "}
            <Box component="strong" sx={{ color: "text.primary" }}>
              {archiveTarget?.name}
            </Box>
            ? It will remain in the database, but it will no longer be editable
            through the current project update endpoint.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setArchiveTarget(null)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleArchive}
            disabled={isSaving}
          >
            {isSaving ? "Archiving..." : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      {(role) => <ProjectsContent role={role} />}
    </DashboardLayout>
  );
}
