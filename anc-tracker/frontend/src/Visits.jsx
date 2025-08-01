// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import HealthMetricsChart from "../components/HealthMetricsChart";
// import { useParams } from "react-router-dom";
// import {
//   Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Button, Typography, Box
// } from "@mui/material";
// import VisitDetails from "./VisitDetails";

// function Visits() {
//   const { userId } = useParams();
//   const [visits, setVisits] = useState([]);
//   const [selectedVisit, setSelectedVisit] = useState(null);

//   const fetchVisits = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8000/users/${userId}/visits`);
//       setVisits(response.data.visits);
//     } catch (err) {
//       console.error("Error fetching visits:", err);
//     }
//   };

//   useEffect(() => {
//     if (userId) fetchVisits();
//   }, [userId]);

//   return (
//     <TableContainer component={Paper}>
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>Visit No.</TableCell>
//             <TableCell>Scheduled Date</TableCell>
//             <TableCell>Status</TableCell>
//             <TableCell>Actions</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {visits.length > 0 ? (
//             visits.map((visit) => (
//               <React.Fragment key={visit._id}>
//                 <TableRow>
//                   <TableCell>{visit.visit_number}</TableCell>
//                   <TableCell>{visit.scheduled_date}</TableCell>
//                   <TableCell>{visit.status}</TableCell>
//                   <TableCell>
//                     {visit.status === "Pending" && (
//                       <Button
//                         variant="outlined"
//                         onClick={() => setSelectedVisit(visit._id)}
//                       >
//                         Mark Visited
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>

//                 {/* Detail row for visited appointments */}
//                 {visit.status === "Visited" && (
//                   <TableRow>
//                     <TableCell colSpan={4}>
//                       <Box sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
//                         <Typography variant="body2">
//                           <strong>Actual Visit Date:</strong> {visit.actual_visit_date || "N/A"}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Blood Pressure:</strong> {visit.bp || "N/A"}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Weight:</strong> {visit.weight || "N/A"} kg
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Notes:</strong> {visit.notes || "N/A"}
//                         </Typography>
//                       </Box>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </React.Fragment>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell colSpan={4} align="center">
//                 No visits available.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>

//       {selectedVisit && (
//         <>
//           <Typography variant="h6" sx={{ mt: 3, ml: 2 }}>
//             Fill Visit Details
//           </Typography>
//           <VisitDetails
//             visitId={selectedVisit}
//             onSuccess={() => {
//               setSelectedVisit(null);
//               fetchVisits();
//             }}
//           />
//         </>
//       )}
//     </TableContainer>
    
//   );
// }

// export default Visits;

import React, { useState, useEffect } from "react";
import axios from "axios";
import VaccinationTable from "../components/VaccinationTable";
import VisitSummary from "../components/VisitSummary";
import HealthMetricsChart from "../components/HealthMetricsChart";
import { useParams } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Typography, Box
} from "@mui/material";
import VisitDetails from "./VisitDetails";

function Visits() {
  const { userId } = useParams();
  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const fetchVisits = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/users/${userId}/visits`);
      setVisits(response.data.visits);
    } catch (err) {
      console.error("Error fetching visits:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchVisits();
  }, [userId]);

  return (
  <>
  <VaccinationTable/>
  <br></br>
  {visits.length > 0 && <VisitSummary visits={visits} />}
  
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Visit No.</TableCell>
            <TableCell>Scheduled Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visits.length > 0 ? (
            visits.map((visit) => (
              <React.Fragment key={visit._id}>
                <TableRow>
                  <TableCell>{visit.visit_number}</TableCell>
                  <TableCell>{visit.scheduled_date}</TableCell>
                  <TableCell>{visit.status}</TableCell>
                  <TableCell>
                    {visit.status === "Pending" && (
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedVisit(visit._id)}
                      >
                        Mark Visited
                      </Button>
                    )}
                  </TableCell>
                </TableRow>

                {visit.status === "Visited" && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box sx={{ p: 2, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>Actual Visit Date:</strong> {visit.actual_visit_date || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Blood Pressure:</strong> {visit.bp || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Weight:</strong> {visit.weight || "N/A"} kg
                        </Typography>
                        <Typography variant="body2">
                          <strong>Notes:</strong> {visit.notes || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No visits available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedVisit && (
        <>
          <Typography variant="h6" sx={{ mt: 3, ml: 2 }}>
            Fill Visit Details
          </Typography>
          <VisitDetails
            visitId={selectedVisit}
            onSuccess={() => {
              setSelectedVisit(null);
              fetchVisits();
            }}
          />
        </>
      )}
    </TableContainer>

    {visits.length > 0 && <HealthMetricsChart visits={visits} />}
    

  </>
);

}

export default Visits;
