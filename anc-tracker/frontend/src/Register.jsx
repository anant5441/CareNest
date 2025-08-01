import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography } from "@mui/material";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    address: "",
    lmp: "",
    edd: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/register/", formData);
      alert(response.data.message);
    } catch (error) {
      alert("Error: " + error.response.data.detail);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Pregnant Woman Registration</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <TextField
          label="Age"
          type="number"
          fullWidth
          margin="normal"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        />
        <TextField
          label="Phone"
          fullWidth
          margin="normal"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <TextField
          label="Address"
          fullWidth
          margin="normal"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <TextField
          label="Last Menstrual Period (YYYY-MM-DD)"
          fullWidth
          margin="normal"
          value={formData.lmp}
          onChange={(e) => setFormData({ ...formData, lmp: e.target.value })}
        />
        <TextField
          label="Expected Delivery Date (YYYY-MM-DD)"
          fullWidth
          margin="normal"
          value={formData.edd}
          onChange={(e) => setFormData({ ...formData, edd: e.target.value })}
        />
        <Button type="submit" variant="contained" color="primary">
          Register
        </Button>
      </form>
    </Container>
  );
}

export default Register;