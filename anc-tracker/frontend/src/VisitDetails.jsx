import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

function VisitDetails({ visitId }) {
  const [formData, setFormData] = useState({
  bp: "",
  weight: "",
  notes: "",
  pulse: ""
});


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/visits/${visitId}/mark-visited`, formData);
      alert("Visit marked as completed!");
      window.location.reload(); // Refresh to show updated status
    } catch (error) {
      alert("Error: " + error.response.data.detail);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h6" gutterBottom>Log ANC Visit Details</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Blood Pressure (e.g., 120/80)"
          fullWidth
          margin="normal"
          value={formData.bp}
          onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
        />
        <TextField
  label="Pulse (bpm)"
  type="number"
  fullWidth
  margin="normal"
  value={formData.pulse}
  onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
/>

        <TextField
          label="Weight (kg)"
          type="number"
          fullWidth
          margin="normal"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
        />
        <TextField
          label="Notes"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default VisitDetails;