import React, { useState, useEffect } from 'react'
import { Button, Card } from "@chakra-ui/react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const OrdersView = () => {

  const [orderDetails, setOrderDetails] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5119/Order/GetFirst10');
      const orderKeys = response.data;

      const orders = await Promise.all(
        orderKeys.map(async (key) => {
          const orderResponse = await axios.get(`http://localhost:5119/Order/GetOrder/${key}`);
          const orderData = orderResponse.data;
          const orderNo = key.split(':').pop();

          const productKeys = Object.keys(orderData).filter(key => key.startsWith('menu:'));
          const productDetails = await Promise.all(
            productKeys.map(async (productKey) => {
              const productResponse = await axios.get(`http://localhost:5119/MenuItem/ReadItem/${productKey}`);
              return {
                name: productResponse.data.name,
                quantity: orderData[productKey],
              };
            })
          );

          return {
            orderKey : key,
            orderNumber: orderNo,
            createdAt: orderData.createdAt,
            products: productDetails,
          };
        })
      );

      setOrderDetails(orders);
    } catch (error) {
      console.error('Greška pri dobijanju narudžbina:', error);
    }
  };

  useEffect(() => {
    setInterval(() => {
      fetchOrders();
    }, 10000); 
  }, []);

  const confirmOrder = async(key) => {
    try {
      const response = await axios.post(`http://localhost:5119/Order/ConfirmOrder/${key}`);
      await fetchOrders();

    } catch (error) {
      console.error(`Greška pri potvrđivanju narudžbine #${key}:`, error);
    }
  }

  return (
    <div className="sekcije">
      <section>
        <div className="items-container">
          <div className="menu-container">
          {orderDetails.map((order) => (
            <Card.Root
              key={`${order.orderNumber}`} 
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
              </Card.Body>
              <Button onClick={() => confirmOrder(order.orderKey)} style={{borderRadius: '10px', margin: '10px 10px 10px 10px', fontWeight: 'bold'}}>
                  Odobri
              </Button>
            </Card.Root>
          ))}
          </div>
        </div>
      </section>
    </div>
  )
}
