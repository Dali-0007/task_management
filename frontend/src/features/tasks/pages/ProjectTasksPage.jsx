import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Chip,
  CircularProgress,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import projectService from "../../projects/services/projectService";
import taskService from "../services/taskService";
import TaskWorkspace from "../components/TaskWorkspace";
import { getApiErrorMessage } from "../utils/taskFormatters";
import {
  pageHeaderSx,
  pageSubtitleSx,
  pageTitleSx,
} from "../../../styles/commonStyles";

function useProjectWithProgress(projectId) {
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchProject() {
      try {
        const [projectResult, completed] = await Promise.all([
          projectService.getProjectById(projectId),
          taskService.getTasks({ projectId, status: "COMPLETED", limit: 1 }),
        ]);
        const all = await taskService.getTasks({ projectId, limit: 1 });

        if (isMounted) {
          setProject(projectResult);
          setProgress({ completed: completed.total, total: all.total });
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.response?.status === 404
              ? "This project doesn't exist or you're not a member of it."
              : getApiErrorMessage(loadError, "Unable to load the project.")
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [projectId, reloadKey]);

  return {
    project,
    progress,
    error,
    isLoading,
    reload: () => setReloadKey((key) => key + 1),
  };
}

function ProjectTasksContent({ role }) {
  const { projectId } = useParams();
  const { project, progress, error, isLoading, reload } =
    useProjectWithProgress(projectId);
  const baseQuery = useMemo(() => ({ projectId }), [projectId]);

  const breadcrumbs = (
    <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1.5 }}>
      <Link component={RouterLink} to="/dashboard/projects" underline="hover" color="inherit">
        Projects
      </Link>
      <Typography color="text.primary">{project?.name ?? "Project"}</Typography>
    </Breadcrumbs>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress aria-label="Loading project" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        {breadcrumbs}
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const isActive = project.status === "ACTIVE";
  const percent = progress.total
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <Box>
      {breadcrumbs}

      <Box sx={pageHeaderSx}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography component="h1" sx={pageTitleSx}>
            {project.name}
          </Typography>
          <Chip size="small" label={project.status} color={isActive ? "success" : "default"} />
        </Stack>
        <Typography sx={pageSubtitleSx}>
          {project.description || "No description provided."}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {progress.completed} of {progress.total} completed ({percent}%)
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percent}
          aria-label={`${project.name} progress`}
        />
      </Paper>

      {!isActive && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This project is archived. Its tasks are read-only.
        </Alert>
      )}

      <TaskWorkspace
        baseQuery={baseQuery}
        showProject={false}
        canCreate={role === "PROJECT_MANAGER" && isActive}
        createProjects={[project]}
        defaultProjectId={project.id}
        emptyTitle="No tasks in this project"
        emptyMessage={
          role === "PROJECT_MANAGER" && isActive
            ? "Create the first task for this project."
            : "Tasks added to this project will appear here."
        }
        onTasksChanged={reload}
      />
    </Box>
  );
}

export default function ProjectTasksPage() {
  return (
    <DashboardLayout>
      {(role) => <ProjectTasksContent role={role} />}
    </DashboardLayout>
  );
}
