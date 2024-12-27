import { UserFetch } from '@/components/UserFetch/UserFetch';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Card, Image, Text, HStack, Input} from "@chakra-ui/react";
import Steps from '@/components/Steps/Steps';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = await UserFetch();
      if (user) {
        setUser(user);
        try {
          // Dohvatanje narudžbina korisnika
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
              };
            })
          );

          setOrders(orderDetails); 
          console.log(orderDetails);
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    };

    fetchOrders();
  }, []);

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

                <Steps/>
              </Card.Body>
            </Card.Root>
          ))}
        </div>
      </div>
    </section>
  </div>
  );
};
