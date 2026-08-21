import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Mattress from "./pages/Mattress";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mattress" element={<Mattress />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
