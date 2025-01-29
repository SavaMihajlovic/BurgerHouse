import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Image, Text} from "@chakra-ui/react";
import MobileStepper from '@/components/MobileStepper/MobileStepper';
import { createListCollection } from "@chakra-ui/react"
import { SelectContent, SelectItem, SelectLabel, SelectRoot, SelectTrigger, SelectValueText,
} from "@/components/ui/select"
import { UserFetch } from '@/components/UserFetch/UserFetch';
import { useNavigate } from 'react-router-dom';


export const Order = () => {

  const frameworks = createListCollection({
    items: [
      { label: "Burgeri", value: "burger" },
      { label: "Prilozi", value: "fries" },
      { label: "Pića", value: "drinks" },
    ],
  })

  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0); 
  const [selectedType, setSelectedType] = useState("");
  const [user, setUser] = useState(null);
  const [orderList, setOrderList] = useState([]); // lista item-a za placanje
  const navigate = useNavigate();

  const handleAddItem = (price, key, quantity) => {
    const existingItem = orderList.find(item => item.key === key);

    let newOrderList;
    if (existingItem) {
      newOrderList = orderList.map(item =>
        item.key === key ? { ...item, quantity: quantity } : item
      );
    } else {
      newOrderList = [...orderList, { key, quantity }];
    }

    setOrderList(newOrderList);

    const newTotal = totalAmount + Number(price);
    setTotalAmount(newTotal);
  };

  const handleRemoveItem = (price, key, quantity) => {

    const existingItem = orderList.find(item => item.key === key);

    let newOrderList;

    if (existingItem) {
      if (quantity === 0) {
        newOrderList = orderList.filter(item => item.key !== key);
      } else {
        newOrderList = orderList.map(item =>
          item.key === key ? { ...item, quantity: quantity } : item
        );
      }
    } else {
      newOrderList = orderList;
    }

    setOrderList(newOrderList);

    const newTotal = totalAmount - Number(price);
    setTotalAmount(newTotal);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {

        const menuUrl = selectedType === "" 
          ? 'http://localhost:5119/MenuItem/ReadAllItems'
          : `http://localhost:5119/MenuItem/ReadAllSpecific/${selectedType}`;
          
        const allItemsResponse = await axios.get(menuUrl);
        const allItems = allItemsResponse.data;

        
        const itemDetailsPromises = allItems.map(async (item) => {
          const key = selectedType === "" ? item : item.key;
          const itemDetailsResponse = await axios.get(`http://localhost:5119/MenuItem/ReadItem/${key}`);
          return { key, ...itemDetailsResponse.data };
        });
  
        const detailedItems = await Promise.all(itemDetailsPromises);
        setItems(detailedItems.filter((item) => item !== null));
  
        const sessionKey = localStorage.getItem('sessionKey');
        const user = await UserFetch(sessionKey);
        if (user) {
          setUser(user); 
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [selectedType]);

  const handleSelectChange = (item) => {
    setSelectedType(item.value);
  };

  const handlePayment = async () => {
    console.log(orderList);
    if (user.digitalcurrency >= totalAmount) {
      const orderData = {
        userID: `user:${user.userEmail}`, 
        items: orderList.map(item => ({
          itemKey: item.key,  
          quantity: item.quantity
        })),
        createdAt: new Date().toISOString()  
      };

      try {
        const response = await axios.post('http://localhost:5119/Order/MakeOrder', orderData);
        alert('Uspešno ste kreirali narudžbinu!');
        navigate('/kupac-my-orders');
      } catch (error) {
        console.error('Error placing order', error);
      }
    } else {
      alert('Nema dovoljno sredstava za plaćanje!');
    }
  };

  return (
    <>
    <div className='sekcije'>
      <section>
        <SelectRoot style={{ marginBottom: '30px'}} 
                    collection={frameworks} 
                    size="sm" 
                    width="320px"
                    onValueChange={handleSelectChange}>
          <SelectLabel>Vrsta proizvoda</SelectLabel>
          <SelectTrigger style={{ backgroundColor: 'white', borderRadius: '5px', color: 'black' }}>
            <SelectValueText style={{ color: '#5C5C64', padding: '5px' }} placeholder="Izaberi proizvod" />
          </SelectTrigger>
          <SelectContent>
            {frameworks.items.map((x) => (
              <SelectItem item={x} key={x.value} style={{ color: 'black', padding: '8px'}}>
                {x.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>

        <div className="items-container">
          <div className="menu-container">
            {items.map((item, index) => (
              <Card.Root 
                key={item.id || index} 
                maxW="sm" 
                overflow="hidden" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  flex: '1 1 300px', 
                }}
              >
                <Image
                  alt={item.name} 
                  src={item.image ? `${item.image}` : ''}
                  style={{
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                  }}
                />
                <Card.Body 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1, 
                    padding: '10px'
                  }} 
                  gap="2"
                >
                  <Card.Title>{item.name}</Card.Title>
                  <Card.Description>
                    {item.description || 'No description available.'}
                  </Card.Description>
                  <div style={{ marginTop: 'auto' }}>
                    <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight">
                      {item.price || 'N/A'} RSD
                    </Text>
                  </div>
                </Card.Body>
                <Card.Footer gap="2">
                  <MobileStepper 
                    handleAddItem={handleAddItem} 
                    handleRemoveItem={handleRemoveItem} 
                    price={item.price}
                    itemKey={item.key}
                  />
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>
    </div>

    {totalAmount > 0 && (
         <div className="payment-footer" onClick={handlePayment}>
         <Text fontSize="md">
           Idi na plaćanje <span style={{fontWeight: 'bolder'}}>{totalAmount} RSD</span>
         </Text>
       </div>
      )}
    </>
  );
};
