import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import { Home } from "./pages/Homes";
import { DominioDetail } from "./pages/DominioDetail";
import { AreaDetail } from "./pages/AreaDetail";

function App() {
  return(
    <ToastProvider>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/dominio/:id" element={<DominioDetail/>} />
        <Route path="/dominio/:id/area/:areaId" element={<AreaDetail/>} />
      </Routes>
    </ToastProvider>
  )
}

export default App