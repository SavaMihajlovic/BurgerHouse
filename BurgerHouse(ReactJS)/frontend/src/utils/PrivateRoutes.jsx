import React, { useEffect } from 'react';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';
import { UserFetch } from '@/components/UserFetch/UserFetch';

const PrivateRoutes = ({role}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const sessionKey = localStorage.getItem('sessionKey');

    if (!sessionKey) {
      navigate('/'); 
      return;
    }

    axios.get(`http://localhost:5119/User/GetSession/${sessionKey}`)
      .then((response) => {
        if (response.status !== 200) {
          localStorage.removeItem('sessionKey');
          navigate('/'); 
        }
      })
      .catch((error) => {
        console.error('Greška pri proveri sesije:', error);
        localStorage.removeItem('sessionKey');
        navigate('/');
      });


      const checkUserRole = async() => {
        const user = await UserFetch(sessionKey);
        if(user && user.role !== role) {
          navigate('/');
        }
      }

      checkUserRole();
  }, [navigate,role]);

  return <Outlet />; 
};

export default PrivateRoutes;
