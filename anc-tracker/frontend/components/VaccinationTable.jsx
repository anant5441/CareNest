import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Button, Typography
} from "@mui/material";
import { useParams } from "react-router-dom";

function VaccinationTable() {
  const { userId } = useParams();
  const [vaccines, setVaccines] = useState([]);

  const fetchVaccines = async () => {
    const res = await axios.get(`http://localhost:8000/users/${userId}/vaccinations`);
    setVaccines(res.data.vaccines);
  };

  const markCompleted = async (id) => {
    await axios.put(`http://localhost:8000/vaccinations/${id}/mark-completed`);
    fetchVaccines(); // Refresh list
  };

  useEffect(() => {
    if (userId) fetchVaccines();
  }, [userId]);

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Vaccination Schedule</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Vaccine</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vaccines.map((vaccine) => (
            <TableRow key={vaccine._id}>
              <TableCell>{vaccine.name}</TableCell>
              <TableCell>{vaccine.due_date}</TableCell>
              <TableCell>{vaccine.status}</TableCell>
              <TableCell>
                {vaccine.status === "Pending" && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => markCompleted(vaccine._id)}
                  >
                    Mark Completed
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default VaccinationTable;
