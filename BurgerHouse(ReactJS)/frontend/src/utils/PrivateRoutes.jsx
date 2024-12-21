import React, { useEffect } from 'react';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';

const PrivateRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sessionKey = localStorage.getItem('sessionKey');

    if (!sessionKey) {
      navigate('/'); 
      return;
    }

    axios.post(`http://localhost:5119/User/GetSession/${sessionKey}`)
      .then((response) => {
        if (response.status !== 200) {
          navigate('/'); 
        }
      })
      .catch((error) => {
        console.error('Greška pri proveri sesije:', error);
        navigate('/');
      });
  }, [navigate]);

  return <Outlet />; 
};

export default PrivateRoutes;
