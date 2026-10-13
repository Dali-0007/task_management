import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";

import DashboardLayout from "../dashboard/DashboardLayout";
import { emptyStateSx, statIconSx } from "../../styles/commonStyles";

export default function NotFoundPage() {
  return (
    <DashboardLayout>
      <Paper variant="outlined" sx={emptyStateSx}>
        <Box sx={{ ...statIconSx.indigo, mx: "auto", mb: 2 }}>
          <SearchOffOutlined />
        </Box>
        <Typography component="h1" variant="h6">
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/dashboard">
          Back to dashboard
        </Button>
      </Paper>
    </DashboardLayout>
  );
}
