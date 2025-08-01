// import React, { useRef } from "react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { Button, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
// import HealthMetricsChart from "./HealthMetricsChart"; // chart component you already made

// function VisitReport({ visits }) {
//   const reportRef = useRef();

//   const generatePDF = async () => {
//     const input = reportRef.current;
//     const canvas = await html2canvas(input);
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF("p", "mm", "a4");
//     const width = pdf.internal.pageSize.getWidth();
//     const height = (canvas.height * width) / canvas.width;

//     pdf.addImage(imgData, "PNG", 0, 0, width, height);
//     pdf.save("anc-visit-report.pdf");
//   };

//   return (
//     <Box>
//       <Box sx={{ mb: 2 }}>
//         <Button variant="contained" onClick={generatePDF}>
//           Download Report as PDF
//         </Button>
//       </Box>

//       {/* Content to export as PDF */}
//       <Box ref={reportRef} sx={{ p: 2, backgroundColor: "#fff" }}>
//         <Typography variant="h5" gutterBottom>
//           ANC Visit Report
//         </Typography>

//         <Typography variant="subtitle1" gutterBottom>
//           Total Visits: {visits.length}
//         </Typography>

//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               <TableCell>Visit No.</TableCell>
//               <TableCell>Scheduled</TableCell>
//               <TableCell>Actual</TableCell>
//               <TableCell>BP</TableCell>
//               <TableCell>Weight</TableCell>
//               <TableCell>Notes</TableCell>
//               <TableCell>Status</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {visits.map((v) => (
//               <TableRow key={v._id}>
//                 <TableCell>{v.visit_number}</TableCell>
//                 <TableCell>{v.scheduled_date}</TableCell>
//                 <TableCell>{v.actual_visit_date || "-"}</TableCell>
//                 <TableCell>{v.bp || "-"}</TableCell>
//                 <TableCell>{v.weight || "-"}</TableCell>
//                 <TableCell>{v.notes || "-"}</TableCell>
//                 <TableCell>{v.status}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>

//         {/* Chart (you already built this) */}
//         <Box sx={{ mt: 4 }}>
//           <HealthMetricsChart visits={visits} />
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// export default VisitReport;

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Button, Box, Typography, Table, TableHead,
  TableRow, TableCell, TableBody
} from "@mui/material";
import HealthMetricsChart from "./HealthMetricsChart"; // Chart component

function VisitReport({ visits }) {
  const reportRef = useRef();

  const generatePDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("anc-visit-report.pdf");
  };

  return (
    <>
      {/* Only the Button is visible */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={generatePDF}>
          Download Report as PDF
        </Button>
      </Box>

      {/* Hidden content for PDF export */}
      <Box
  ref={reportRef}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "1000px", // ensure canvas has size
    padding: "20px",
    background: "#fff",
    visibility: "hidden", // still renders, just hidden from user
    zIndex: -9999,
  }}
>

        <Typography variant="h5" gutterBottom>
          ANC Visit Report
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Total Visits: {visits.length}
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Visit No.</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell>Actual</TableCell>
              <TableCell>BP</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.map((v) => (
              <TableRow key={v._id}>
                <TableCell>{v.visit_number}</TableCell>
                <TableCell>{v.scheduled_date}</TableCell>
                <TableCell>{v.actual_visit_date || "-"}</TableCell>
                <TableCell>{v.bp || "-"}</TableCell>
                <TableCell>{v.weight || "-"}</TableCell>
                <TableCell>{v.notes || "-"}</TableCell>
                <TableCell>{v.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Chart (optional in PDF) */}
        <Box sx={{ mt: 4 }}>
          <HealthMetricsChart visits={visits} />
        </Box>
      </Box>
    </>
  );
}

export default VisitReport;

