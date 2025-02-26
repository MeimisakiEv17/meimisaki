import { HashRouter as Router, Route, Routes } from "react-router-dom";
import VPApprovalSystem from "./components/VPApprovalSystem";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<VPApprovalSystem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;