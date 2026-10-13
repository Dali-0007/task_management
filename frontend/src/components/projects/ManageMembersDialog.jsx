
import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import useProjectMembers from "../../features/projects/hooks/useProjectMembers";

function ManageMembersDialog({
  open,
  onClose,
  onMembersChanged,
  project,
  role,
  currentUserId,
}) {
  const isManager = role === "PROJECT_MANAGER";
  const projectId = project?.id;

  const {
    members,
    availableUsers,
    isLoading,
    isSearching,
    error,
    searchUsers,
    addMember,
    removeMember,
  } = useProjectMembers(open ? projectId : null);

  const [search, setSearch] = useState("");
  const [processingUserId, setProcessingUserId] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);

  useEffect(() => {
    if (search.trim().length < 2 || !open) return undefined;

    const timeoutId = setTimeout(() => {
      searchUsers(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, searchUsers, open]);

  const handleClose = () => {
    setSearch("");
    setConfirmRemove(null);
    onClose();
  };

  const handleAdd = async (userId) => {
    setProcessingUserId(userId);

    const success = await addMember(userId);

    setProcessingUserId(null);

    if (success) {
      onMembersChanged?.();
    }
  };

  const handleRemove = async (userId) => {
    setProcessingUserId(userId);

    const success = await removeMember(userId);

    setProcessingUserId(null);

    if (success) {
      setConfirmRemove(null);
      onMembersChanged?.();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">Project Members</Typography>
            <Typography variant="body2" color="text.secondary">
              {project?.name}
            </Typography>
          </Box>

          <IconButton onClick={handleClose} aria-label="Close dialog">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Current Members ({members.length})
        </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : members.length === 0 ? (
          <Typography color="text.secondary" py={2}>
            No members found for this project.
          </Typography>
        ) : (
          <List disablePadding>
            {members.map((member) => (
              <ListItem
                key={member.id}
                divider
                secondaryAction={
                  isManager &&
                  String(member.id) !== String(currentUserId) && (
                    <IconButton
                      edge="end"
                      color="error"
                      aria-label={`Remove ${member.name}`}
                      disabled={processingUserId === member.id}
                      onClick={() => setConfirmRemove(member)}
                    >
                      <PersonRemoveOutlinedIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    {member.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={member.name}
                  secondary={`${member.email} · ${member.role.replaceAll("_", " ")}`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {isManager && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Add Members
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Search by name or email"
              placeholder="Enter at least 2 characters"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {isSearching && (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            )}

            {!isSearching &&
              search.trim().length >= 2 &&
              availableUsers.length === 0 && (
                <Typography color="text.secondary" variant="body2" mt={2}>
                  No available users found.
                </Typography>
              )}

            <List disablePadding>
              {availableUsers.map((user) => (
                <ListItem
                  key={user.id}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="primary"
                      aria-label={`Add ${user.name}`}
                      disabled={processingUserId === user.id}
                      onClick={() => handleAdd(user.id)}
                    >
                      {processingUserId === user.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PersonAddAltOutlinedIcon />
                      )}
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={user.name}
                    secondary={`${user.email} · ${user.role.replaceAll("_", " ")}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {confirmRemove && (
          <Alert
            severity="warning"
            action={
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  onClick={() => setConfirmRemove(null)}
                >
                  Cancel
                </Button>

                <Button
                  size="small"
                  color="error"
                  disabled={processingUserId === confirmRemove.id}
                  onClick={() => handleRemove(confirmRemove.id)}
                >
                  Remove
                </Button>
              </Box>
            }
            sx={{ mt: 2, alignItems: "center" }}
          >
            Remove {confirmRemove.name} from this project?
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ManageMembersDialog;
