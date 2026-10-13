import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import {
  cardTitleSx,
  detailRowSx,
  eyebrowSx,
  pageHeaderSx,
  pageSubtitleSx,
  pageTitleSx,
} from "../../../styles/commonStyles";

const roleLabels = {
  PROJECT_MANAGER: "Project Manager",
  TEAM_MEMBER: "Team Member",
};

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ProfileContent() {
  const { user } = useAuth();
  const roleLabel = roleLabels[user.role] ?? user.role;

  return (
    <Box>
      <Box sx={pageHeaderSx}>
        <Typography sx={eyebrowSx}>Account</Typography>
        <Typography component="h1" sx={pageTitleSx}>
          My Profile
        </Typography>
        <Typography sx={pageSubtitleSx}>
          Your account details in ADN TECH Task Manager.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, maxWidth: 640 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
            {getInitials(user.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...cardTitleSx, fontSize: 18 }}>
              {user.name}
            </Typography>
            <Chip size="small" label={roleLabel} sx={{ mt: 0.75 }} />
          </Box>
        </Stack>

        <Box>
          <Box sx={detailRowSx}>
            <span>Full name</span>
            <span>{user.name}</span>
          </Box>
          <Box sx={detailRowSx}>
            <span>Email</span>
            <Box component="span" sx={{ overflowWrap: "anywhere" }}>
              {user.email}
            </Box>
          </Box>
          <Box sx={detailRowSx}>
            <span>Role</span>
            <span>{roleLabel}</span>
          </Box>
          <Box sx={detailRowSx}>
            <span>Member since</span>
            <span>
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "—"}
            </span>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
          Profile editing isn&apos;t available yet.
        </Typography>
      </Paper>
    </Box>
  );
}

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileContent />
    </DashboardLayout>
  );
}
