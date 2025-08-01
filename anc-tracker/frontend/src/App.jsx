import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Visits from "./Visits";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/visits/:userId" element={<Visits />} />
      </Routes>
    </Router>
  );
}

export default App;