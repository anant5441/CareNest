import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import { Typography, Box } from "@mui/material";
import dayjs from "dayjs"; // For date calculation

function EDDCountdown({ lmp, edd }) {
  const lmpDate = dayjs(lmp);
  const eddDate = dayjs(edd);
  const today = dayjs();

  const totalWeeks = 40;
  const weeksElapsed = today.diff(lmpDate, "week");
  const weeksRemaining = totalWeeks - weeksElapsed;

  const percentage = Math.min((weeksElapsed / totalWeeks) * 100, 100);

  return (
    <Box sx={{ width: 200, textAlign: "center", m: "auto" }}>
      <CircularProgressbar
        value={percentage}
        text={`${weeksRemaining} wk left`}
        styles={buildStyles({
          textSize: '14px',
          pathColor: "#1976d2",
          textColor: "#333",
          trailColor: "#e0e0e0"
        })}
      />
      <Typography variant="subtitle2" mt={1}>
        EDD: {eddDate.format("DD MMM YYYY")}
      </Typography>
    </Box>
  );
}

export default EDDCountdown;
