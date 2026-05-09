import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Matress from "./pages/Mattress"
import ProductDetail from "./pages/ProductDetail";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mattress" element={<Matress />} />
        <Route path="/product-detail" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
