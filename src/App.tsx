import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import AppRoutes from "./routes/AppRoutes";
import FooterInfo from "./components/FooterInfo/FooterInfo";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes />
      <FooterInfo />
      <Footer />
    </BrowserRouter>
  );
};

export default App;
