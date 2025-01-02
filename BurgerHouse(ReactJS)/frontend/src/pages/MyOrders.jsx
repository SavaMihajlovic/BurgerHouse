import { UserFetch } from '@/components/UserFetch/UserFetch';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const sessionKey = localStorage.getItem('sessionKey');
    const user = await UserFetch(sessionKey);
    if (user) {
      setUser(user);
      try {
        
        const ordersResponse = await axios.get(
          `http://localhost:5119/Order/GetOrderFromUser/user:${user.userEmail}`
        );

        const orders = ordersResponse.data;
        const orderDetails = await Promise.all(
          Object.entries(orders).map(async ([orderKey, items]) => {

            const orderNumber = orderKey.split(':').pop();
      
            const productDetails = await Promise.all(
              Object.entries(items)
                .filter(([key]) => !key.startsWith('createdAt'))
                .filter(([key]) => !key.startsWith('completedAt'))
                .map(async ([productKey, quantity]) => {
                  const productResponse = await axios.get(
                    `http://localhost:5119/MenuItem/ReadItem/${productKey}`
                  );
                  return {
                    name: productResponse.data.name, 
                    quantity, 
                  };
                })
            );

            return {
              orderNumber,
              createdAt: items.createdAt,
              products: productDetails,
              completedAt: items.completedAt ? items.completedAt : undefined
            };
          })
        );

        setOrders(orderDetails); 
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    }
  };

  const checkOrderStatus = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `http://localhost:5119/User/GetNotifications/${user.userEmail}/user`
        );

        if (response.status === 200) {
          console.log(response.data);
          navigate('/kupac-my-orders');
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    }
  };

  useEffect(() => {

    const initialize = async () => {
      await fetchOrders(); 
      await checkOrderStatus(); 
    };

    initialize();

    const intervalId = setInterval(checkOrderStatus,10000);

    return () => {
      clearInterval(intervalId); 
    };
  }, [orders]);

  return (
    <div className="sekcije">
    <section>
      <div className="items-container">
        <div className="menu-container">
          {orders.map((order) => (
            <Card.Root
              key={order.orderNumber}
              maxW="sm"
              overflow="hidden"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                flex: '1 1 300px',
                marginBottom: '20px',
                border: order.completedAt ? '5px solid green' : '5px solid yellow',
                backgroundColor : order.completedAt ?  'lightgreen' : 'lightyellow'
              }}
            >
              <Card.Body
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  padding: '10px',
                }}
                gap="2"
              >
                <Card.Title>Narudžbina #{order.orderNumber}</Card.Title>
  
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {order.products.map((product, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      <strong>{product.name}</strong> - Količina: <strong>{product.quantity}</strong>
                    </li>
                  ))}
                </ul>
  
                <p style={{ marginTop: '10px', color: 'gray' }}>
                  Kreirano: {order.createdAt}
                </p>

                {order.completedAt && (
                  <p style={{ marginTop: '10px', color: 'gray' }}>
                  Kompletirano: {order.completedAt}
                </p>
                )}               
              </Card.Body>

              {order.completedAt ? (
                    <p style={{ color: 'black', alignSelf: 'center', margin: '0px 0px 10px 0px', fontWeight: 'bold'}}>
                      Spremno.
                    </p>
                  ) : (
                    <p style={{ color: 'black', alignSelf: 'center', margin: '0px 0px 10px 0px', fontWeight: 'bold'}}>
                      U pripremi.
                    </p>
                  )}
                
            </Card.Root>
          ))}
        </div>
      </div>
    </section>
  </div>
  );
};
