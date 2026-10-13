import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { useAuth } from "../../auth/context/AuthContext";
import useUpdateProfile from "../hooks/useUpdateProfile";
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

const NAME_MAX = 100;

function EditNameForm({ currentName }) {
  const { updateProfile, isSaving, error, clearError } = useUpdateProfile();
  const [name, setName] = useState(currentName);
  const [fieldError, setFieldError] = useState("");
  const [saved, setSaved] = useState(false);

  const trimmed = name.trim();
  const unchanged = trimmed === currentName;

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;

    if (!trimmed) {
      setFieldError("Name is required.");
      return;
    }

    setSaved(await updateProfile({ name: trimmed }));
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={1.5} noValidate>
      <Typography variant="subtitle1" fontWeight={700}>
        Edit profile
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)}>
          Your name has been updated.
        </Alert>
      )}

      <TextField
        label="Full name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setFieldError("");
          setSaved(false);
          clearError();
        }}
        error={Boolean(fieldError)}
        helperText={fieldError || "Your email and role can't be changed here."}
        slotProps={{ htmlInput: { maxLength: NAME_MAX } }}
        fullWidth
      />

      <Box>
        <Button type="submit" variant="contained" disabled={isSaving || unchanged}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </Box>
    </Stack>
  );
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

        <Divider sx={{ my: 2.5 }} />

        <EditNameForm currentName={user.name} />
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
