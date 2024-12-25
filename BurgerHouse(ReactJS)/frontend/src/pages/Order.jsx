import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Image, Text, HStack, Input} from "@chakra-ui/react";
import MobileStepper from '@/components/MobileStepper/MobileStepper';
import { SelectContent, SelectItem, SelectLabel, SelectRoot, SelectTrigger, SelectValueText,
} from "@/components/ui/select"


export const Order = () => {
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0); 

  useEffect(() => {
    console.log("Updated Total:", totalAmount);
  }, [totalAmount]); // Ovaj useEffect će se pozvati svaki put kad se `totalAmount` promeni
  

  const handleAddItem = (price) => {
    const newTotal = totalAmount + Number(price);
    setTotalAmount(newTotal);
  };

  const handleRemoveItem = (price) => {
    const newTotal = totalAmount - Number(price);
    setTotalAmount(newTotal);
  };


  useEffect(() => {
    const fetchMenuItems = async () => {
      try {

        const allItemsResponse = await axios.get('http://localhost:5119/MenuItem/ReadAllItems');
        const allItems = allItemsResponse.data;

        const itemDetailsPromises = allItems.map(async (item) => {

          const itemDetailsResponse = await axios.get(`http://localhost:5119/MenuItem/ReadItem/${item}`);
          return itemDetailsResponse.data;
        });

        const detailedItems = await Promise.all(itemDetailsPromises);
        
        setItems(detailedItems.filter((item) => item !== null));
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <div className='sekcije'>
      <section>
        <div className="items-container">
          <div className="menu-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
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
                      {item.price || 'N/A'} din
                    </Text>
                  </div>
                </Card.Body>
                <Card.Footer gap="2">
                  <MobileStepper 
                    handleAddItem={handleAddItem} 
                    handleRemoveItem={handleRemoveItem} 
                    price={item.price}
                  />
                </Card.Footer>
              </Card.Root>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
