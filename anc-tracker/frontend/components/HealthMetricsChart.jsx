// import React from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
// } from "recharts";

// function HealthMetricsChart({ visits }) {
//   // Filter visited only and parse BP
//   const processed = visits
//     .filter((v) => v.status === "Visited")
//     .map((v) => {
//       const bpParts = v.bp ? v.bp.split("/") : [null, null];
//       return {
//         visit: `Visit ${v.visit_number}`,
//         weight: v.weight,
//         systolic: bpParts[0] ? parseInt(bpParts[0]) : null,
//         diastolic: bpParts[1] ? parseInt(bpParts[1]) : null,
//       };
//     });

//   return (
//     <div style={{ width: "100%", height: 300, marginTop: 40 }}>
//       <h3>Weight Over Visits</h3>
//       <ResponsiveContainer>
//         <LineChart data={processed}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="visit" />
//           <YAxis unit=" kg" />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="weight" stroke="#82ca9d" />
//         </LineChart>
//       </ResponsiveContainer>

//       <h3 style={{ marginTop: 40 }}>Blood Pressure Over Visits</h3>
//       <ResponsiveContainer height={300}>
//         <LineChart data={processed}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="visit" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
//           <Line type="monotone" dataKey="diastolic" stroke="#ff7300" name="Diastolic" />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default HealthMetricsChart;

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function HealthMetricsChart({ visits }) {
  const processed = visits
    .filter((v) => v.status === "Visited")
    .map((v) => {
      const bpParts = v.bp ? v.bp.split("/") : [null, null];
      return {
        visit: `Visit ${v.visit_number}`,
        weight: v.weight,
        systolic: bpParts[0] ? parseInt(bpParts[0]) : null,
        diastolic: bpParts[1] ? parseInt(bpParts[1]) : null,
        pulse: v.pulse ? parseInt(v.pulse) : null,
      };
    });

  return (
    <div style={{ width: "100%", marginTop: 40 }}>
      {/* Weight Chart */}
      <h3>Weight Over Visits</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processed}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="visit" />
          <YAxis unit=" kg" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="weight" stroke="#82ca9d" name="Weight" />
        </LineChart>
      </ResponsiveContainer>

      {/* BP + Pulse Chart */}
      <h3 style={{ marginTop: 40 }}>Blood Pressure and Pulse Over Visits</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processed}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="visit" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
          <Line type="monotone" dataKey="diastolic" stroke="#ff7300" name="Diastolic" />
          <Line type="monotone" dataKey="pulse" stroke="#4caf50" name="Pulse" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HealthMetricsChart;
