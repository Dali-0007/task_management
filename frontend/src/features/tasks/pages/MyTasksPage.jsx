import { Box, Typography } from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import FeatureUnavailableNotice from "../../../components/common/FeatureUnavailableNotice";
import {
  eyebrowSx,
  pageHeaderSx,
  pageSubtitleSx,
  pageTitleSx,
} from "../../../styles/commonStyles";

function MyTasksContent({ role }) {
  const isManager = role === "PROJECT_MANAGER";

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

      <FeatureUnavailableNotice
        icon={AssignmentOutlined}
        title="Tasks aren't available yet"
      >
        The server doesn&apos;t provide task endpoints yet. Your tasks will
        appear here once task management is enabled on the server.
      </FeatureUnavailableNotice>
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
