import { useMemo, useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import useProjects from "../../projects/hooks/useProjects";
import TaskWorkspace from "../components/TaskWorkspace";
import {
  eyebrowSx,
  pageHeaderSx,
  pageSubtitleSx,
  pageTitleSx,
} from "../../../styles/commonStyles";

const SCOPE_QUERIES = {
  mine: { assignee: "me" },
  all: {},
};

function MyTasksContent({ role }) {
  const isManager = role === "PROJECT_MANAGER";
  const [scope, setScope] = useState("mine");
  const { projects } = useProjects();

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status === "ACTIVE"),
    [projects]
  );

  return (
    <Box>
      <Box sx={pageHeaderSx}>
        <Typography sx={eyebrowSx}>Workspace</Typography>
        <Typography component="h1" sx={pageTitleSx}>
          My Tasks
        </Typography>
        <Typography sx={pageSubtitleSx}>
          {isManager
            ? "Create, assign and track tasks across your projects."
            : "Track and update the tasks assigned to you."}
        </Typography>
      </Box>

      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        value={scope}
        onChange={(event, value) => value && setScope(value)}
        aria-label="Which tasks to show"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="mine">Assigned to me</ToggleButton>
        <ToggleButton value="all">All my projects</ToggleButton>
      </ToggleButtonGroup>

      <TaskWorkspace
        baseQuery={SCOPE_QUERIES[scope]}
        filterProjects={projects}
        createProjects={activeProjects}
        canCreate={isManager}
        emptyTitle={scope === "mine" ? "Nothing assigned to you" : "No tasks yet"}
        emptyMessage={
          scope === "mine"
            ? "Tasks assigned to you will appear here."
            : isManager
              ? "Create a task to get started."
              : "Tasks in your projects will appear here."
        }
      />
    </Box>
  );
}

export default function MyTasksPage() {
  return (
    <DashboardLayout>
      {(role) => <MyTasksContent role={role} />}
    </DashboardLayout>
  );
}
