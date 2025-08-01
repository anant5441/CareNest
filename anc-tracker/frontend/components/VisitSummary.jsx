import React from "react";
import { Box, Typography, LinearProgress, Grid, Paper } from "@mui/material";

function VisitSummary({ visits }) {
  const total = visits.length;
  const visited = visits.filter(v => v.status === "Visited").length;
  const missed = visits.filter(v => v.status === "Missed").length;
  const pending = visits.filter(v => v.status === "Pending").length;
  const progress = Math.round((visited / total) * 100);

  return (
    <Box component={Paper} elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        ANC Visit Summary
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={4}>
          <Typography><strong>Visited:</strong> {visited}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography><strong>Pending:</strong> {pending}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography><strong>Missed:</strong> {missed}</Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          ANC Coverage Progress ({visited}/{total} visits completed)
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
      </Box>
    </Box>
  );
}

export default VisitSummary;
