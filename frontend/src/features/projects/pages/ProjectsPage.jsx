import { useState } from "react";
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

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import useProjects from "../hooks/useProjects";

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

  const isManager = role === "PROJECT_MANAGER";

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
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
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
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
      setSelectedProject(null);
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to archive the project."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Projects
          </Typography>
          <Typography color="text.secondary">
            View and manage your team's projects.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadProjects}
            disabled={isLoading}
          >
            Refresh
          </Button>

          {isManager && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
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
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Total projects
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {projects.length}
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Active
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {projects.filter((project) => project.status === "ACTIVE").length}
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Archived
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {projects.filter((project) => project.status === "ARCHIVED").length}
          </Typography>
        </Paper>
      </Stack>

      <TextField
        select
        label="Project status"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        sx={{ mb: 3, minWidth: 200 }}
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
            <Button color="inherit" onClick={loadProjects}>
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
        <Paper variant="outlined" sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6">No projects found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter === "ALL"
              ? "You haven't been added to any projects yet."
              : `There are no ${statusFilter.toLowerCase()} projects.`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredProjects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Typography variant="h6" fontWeight={700}>
                    {project.name}
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
                  }}
                >
                  {project.description || "No description provided."}
                </Typography>

                <Typography variant="body2">
                  Members: {project.member_count ?? 0}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Created{" "}
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString()
                    : "—"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: "auto", pt: 1, flexWrap: "wrap" }}
                >
                  <Button
                    size="small"
                    onClick={() => setSelectedProject(project)}
                  >
                    View details
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
                inputProps={{ maxLength: 150 }}
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

          <DialogActions sx={{ p: 2 }}>
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

      <Dialog
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Project details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="h6">{selectedProject.name}</Typography>
              <Chip
                label={selectedProject.status}
                color={
                  selectedProject.status === "ACTIVE" ? "success" : "default"
                }
                sx={{ alignSelf: "flex-start" }}
              />
              <Typography color="text.secondary">
                {selectedProject.description || "No description provided."}
              </Typography>
              <Typography variant="body2">
                Project ID: {selectedProject.id}
              </Typography>
              <Typography variant="body2">
                Members: {selectedProject.member_count ?? 0}
              </Typography>
              <Typography variant="body2">
                Created by user ID: {selectedProject.created_by}
              </Typography>
              <Typography variant="body2">
                Last updated:{" "}
                {selectedProject.updated_at
                  ? new Date(selectedProject.updated_at).toLocaleString()
                  : "—"}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProject(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(archiveTarget)}
        onClose={() => !isSaving && setArchiveTarget(null)}
      >
        <DialogTitle>Archive project?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to archive{" "}
            <strong>{archiveTarget?.name}</strong>? It will remain in the
            database, but it will no longer be editable through the current
            project update endpoint.
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