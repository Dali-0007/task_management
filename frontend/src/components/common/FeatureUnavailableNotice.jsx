import { Box, Paper, Typography } from "@mui/material";
import { emptyStateSx, statIconSx } from "../../styles/commonStyles";

// Shown where a feature depends on a server API that does not exist yet,
// so the UI never falls back to placeholder or mock data.
function FeatureUnavailableNotice({ icon: Icon, title, children }) {
  return (
    <Paper variant="outlined" sx={emptyStateSx} role="status">
      <Box sx={{ ...statIconSx.indigo, mx: "auto", mb: 2 }}>
        <Icon />
      </Box>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 480, mx: "auto" }}>
        {children}
      </Typography>
    </Paper>
  );
}

export default FeatureUnavailableNotice;
