import React from "react";
import { useState } from "react";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from "./pages/Home";


const App = () => {
  return (
    <>
      <div className= 'container'>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
