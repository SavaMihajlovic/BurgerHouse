import React from "react";
import { useState } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from "./pages/Home";
import { Order } from "./pages/Order";
import Navbar from "./components/Navbar/Navbar";
import { HomeKupac } from "./pages/HomeKupac";
import { MyOrders } from "./pages/MyOrders";
import PrivateRoutes from "./utils/PrivateRoutes";
import { HomeRadnik } from "./pages/HomeRadnik";
import { OrdersView } from "./pages/OrdersView";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentFailure } from "./pages/PaymentFailure";
import { MakePayment } from "./pages/MakePayment";


const App = () => {

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  return (
      <div className= 'container'>
        <div className={loginDialogOpen ? 'overlay' : ''}>
          <BrowserRouter>
            <Navbar setLoginDialogOpen={setLoginDialogOpen} />
              <Routes>
                <Route path="/" element={<Home loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failure" element={<PaymentFailure />} />

                <Route element={<PrivateRoutes role = 'user' />}>
                  <Route path="/kupac" element={<HomeKupac loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>} />
                  <Route path="/kupac-order" element={<Order/>} />
                  <Route path="/kupac-my-orders" element={<MyOrders/>} />
                  <Route path="/kupac-make-payment" element={<MakePayment/>} />
                </Route>
                <Route element={<PrivateRoutes role = 'worker' />}>  
                  <Route path="/radnik" element={<HomeRadnik/>} />
                  <Route path="/radnik-orders-view" element={<OrdersView/>} />
                </Route>

              </Routes>
          </BrowserRouter>
        </div>
      </div>
  );
};

export default App;
