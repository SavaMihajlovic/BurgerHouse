import React from "react";
import { useState } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from "./pages/Home";
import { Order } from "./pages/Order";
import Navbar from "./components/Navbar/Navbar";
import { HomeKupac } from "./pages/HomeKupac";
import { MyOrders } from "./pages/MyOrders";


const App = () => {

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  return (
      <div className= 'container'>
        <div className={loginDialogOpen ? 'overlay' : ''}>
          <BrowserRouter>
            <Navbar setLoginDialogOpen={setLoginDialogOpen}/>
              <Routes>
                <Route path="/" element={<Home loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>} />
                <Route path="/kupac" element={<HomeKupac loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>} />
                <Route path="/kupac-order" element={<Order/>} />
                <Route path="/kupac-my-orders" element={<MyOrders/>} />
              </Routes>
          </BrowserRouter>
        </div>
      </div>
  );
};

export default App;
