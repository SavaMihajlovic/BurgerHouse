import React, { useState } from 'react'
import { Text, Input, Box, Grid, VStack, HStack } from "@chakra-ui/react"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Button } from "@/components/ui/button"
import axios from 'axios'

export const AdminOrder = () => {

  const menuItemTypes = ['burger','fries','drinks'];
  const [currentAction, setCurrentAction] = useState('read');

  const [userID, setUserID] = useState('');
  const [items, setItems] = useState([
    { itemKey: '', quantity: '' },
    { itemKey: '', quantity: '' },
    { itemKey: '', quantity: '' },
  ]);
  const [userOrders, setUserOrders] = useState([]);
  const [orderKey, setOrderKey] = useState('');
  const [order, setOrder] = useState([]);
  const [first10Orders, setFirst10Orders] = useState([]);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleMakeOrder = async () => {
    try {
      const createdAt = new Date().toISOString();
      const response = await axios.post(`http://localhost:5119/Order/MakeOrder`, {
        userID,
        items,
        createdAt
      });

      if (response.status === 200) {
        alert(`Uspešno kreiranje narudžbine!`);
      }
    } catch (error) {
      console.error('Error making order:', error);
    }
  };

  const handleGetOrderFromUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5119/Order/GetOrderFromUser/${userID}`);
      if (response.status === 200) {
        setUserOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const handleGetOrder = async () => {
    try {
    const response = await axios.get(`http://localhost:5119/Order/GetOrder/${orderKey}`);
    if (response.status === 200) {
        setOrder(response.data);
        console.log(order);
    }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const handleGetFirst10 = async () => {
    try {
    const response = await axios.get(`http://localhost:5119/Order/GetFirst10`);
    if (response.status === 200) {
        setFirst10Orders(response.data);
        setCurrentAction('readFirst10');
    }
    } catch (error) {
      console.error('Error fetching all MenuItems:', error);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const response = await axios.post(`http://localhost:5119/Order/ConfirmOrder/${orderKey}`);
      if (response.status === 200) {
        alert(`Uspešno kompletiranje narudžbine!`);
      }
    } catch (error) {
      console.error('Error order confirmation:', error);
    }
  };

  const renderContent = () => {
      switch (currentAction) {
        case 'create':
          return (
            <>
              <HStack width="100%" spacing={4}>
                <Text width="150px">ID korisnika :</Text>
                <Input
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                  placeholder='user:email'
                />
              </HStack>
              <VStack display="flex" alignItems="flex-start">
                <Text width="150px" fontWeight="bold">Lista stavki:</Text>
                {items.map((item, index) => (
                  <HStack key={index} width="100%" spacing={3}>
                    <Text width="150px">Item {index + 1} - Ključ:</Text>
                    <Input
                      value={item.itemKey}
                      onChange={(e) => handleChange(index, 'itemKey', e.target.value)}
                      width="25%"
                      color="white"
                      p={3}
                      bg="#2a2629"
                      placeholder='menu:type:name'
                    />
                    <Text width="150px" ml={5}>Količina:</Text>
                    <Input
                      value={item.quantity}
                      onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                      width="25%"
                      color="white"
                      p={3}
                      bg="#2a2629"
                      placeholder="0"
                    />
                  </HStack>
                ))}
              </VStack>
              <HStack width="100%" spacing={4}>
                <Button
                  padding={3}
                  backgroundColor='#007bff'
                  width='200px'
                  variant="solid"
                  _hover={{
                    bg: "#0056b3",
                    color: "white",
                    boxShadow: "md",
                    transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onClick={handleMakeOrder} 
                >
                  Kreiraj
                </Button>
              </HStack>
            </>
          );
        case 'readOrderFromUser':
          return(
          <>
            <HStack width="100%" spacing={4}>
              <Text width="150px">ID korisnika :</Text>
              <Input
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                width="25%"
                color='white'
                p={3}
                bg='#2a2629'
                placeholder='user:email'
              />
            </HStack>
            <HStack width="100%" spacing={4}>
                <Button
                  padding={3}
                  backgroundColor='#007bff'
                  width='200px'
                  variant="solid"
                  _hover={{
                    bg: "#0056b3",
                    color: "white",
                    boxShadow: "md",
                    transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onClick={handleGetOrderFromUser} 
                >
                  Vrati narudžbine
                </Button>
            </HStack>
            {userOrders && Object.keys(userOrders).length > 0 ? (
              <VStack mt={10} display='flex' alignItems='flex-start'>
                {Object.keys(userOrders).map((orderKey, index) => {
                  const order = userOrders[orderKey];
                  const orderNumber = orderKey.split(":").pop();
                  
                  return (
                    <Box key={index} border="1px" borderColor="gray.300" borderRadius="md" mb={4}>
                      <Text fontSize="lg" color="white">Narudžbina broj: {orderNumber}</Text>
                      <VStack alignItems="flex-start" spacing={2} mt={3}>
                        {Object.keys(order)
                          .filter(itemKey => itemKey !== "createdAt") 
                          .map((itemKey, i) => (
                            <HStack key={i} width="100%" spacing={3}>
                              <Text color="white">{itemKey} - Količina: {order[itemKey]}</Text>
                            </HStack>
                          ))}
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Text color="white">Nema narudžbina za prikazivanje.</Text>
            )}
          </>
          );
        case 'readOrder' :
            return(
            <>
                <HStack width="100%" spacing={4}>
                <Text width="150px">Ključ :</Text>
                <Input
                  value={orderKey}
                  onChange={(e) => setOrderKey(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                  placeholder='order:user:email:broj_porudžbine'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                  <Button
                    padding={3}
                    backgroundColor='#007bff'
                    width='200px'
                    variant="solid"
                    _hover={{
                      bg: "#0056b3",
                      color: "white",
                      boxShadow: "md",
                      transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onClick={handleGetOrder} 
                  >
                    Vrati narudžbinu
                  </Button>
              </HStack>

              {order && (
                <VStack mt={5} spacing={2}>
                  {Object.keys(order).map((key, i) => {
                    if (key === "createdAt") return null;
                    return (
                      <HStack key={i} width="100%" spacing={3}>
                        <Text  color="white">{key} - Količina: {order[key]}</Text>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </>
            );
        case 'readFirst10' :
            return(
            <>
            {first10Orders.map((order,index) => {
              return <Text key={index}>{order}</Text>
            })}
            </>
            );
        case 'confirmOrder':
          return (
              <>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Ključ :</Text>
                <Input
                  value={orderKey}
                  onChange={(e) => setOrderKey(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                  placeholder='order:user:email:broj_porudžbine'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Button
                  padding={3}
                  backgroundColor='#007bff'
                  width='200px'
                  variant="solid"
                  _hover={{
                    bg: "#0056b3",
                    color: "white",
                    boxShadow: "md",
                    transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onClick={handleConfirmOrder} 
                >
                  Potvrdi
                </Button>
              </HStack>
            </>
          );
          return (
              <>
                <HStack width="100%" spacing={4}>
                    <Text width="150px">Ključ :</Text>
                    <Input
                        value={menuItemKey}
                        onChange={(e) => setMenuItemKey(e.target.value)}
                        width="25%"
                        color='white'
                        p={3}
                        bg='#2a2629'
                    />
                </HStack>
                <HStack width="100%" spacing={4}>
                    <Button
                    padding={3}
                    backgroundColor='#007bff'
                    width='200px'
                    variant="solid"
                    _hover={{
                        bg: "#0056b3",
                        color: "white",
                        boxShadow: "md",
                        transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onClick={handleDeleteMenuItem} 
                    >
                    Obriši stavku
                    </Button>
                </HStack>
              </>
          );
        default:
          return <Text>Izaberite akciju</Text>;
      }
    };

  return (
    <div className="sekcije">
    <Box padding={20}>
          <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
            <Button
              padding={3}
              colorPalette="green"
              variant="solid"
              _hover={{
                bg: 'dark-green',
                color: 'white',
                boxShadow: 'md',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={() => setCurrentAction('create')}
            >
              Kreiraj narudžbinu
            </Button>
            <Button 
              padding={3}
              colorPalette="blue"
              variant="solid"
              _hover={{
                bg: 'dark-blue',
                color: 'white',
                boxShadow: 'md',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={() => setCurrentAction('readOrderFromUser')}
            >
              Vrati korisnikove narudžbine
            </Button>
            <Button 
              padding={3}
              colorPalette="blue"
              variant="solid"
              _hover={{
                bg: 'dark-blue',
                color: 'white',
                boxShadow: 'md',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={() => setCurrentAction('readOrder')}
            >
              Vrati narudžbinu
            </Button>
            <Button 
              padding={3}
              colorPalette="blue"
              variant="solid"
              _hover={{
                bg: 'dark-blue',
                color: 'white',
                boxShadow: 'md',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={handleGetFirst10}
            >
              Vrati prve 10 narudžbine
            </Button>
            <Button
              padding={3}
              colorPalette="green"
              variant="solid"
              _hover={{
                bg: 'dark-green',
                color: 'white',
                boxShadow: 'md',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={() => setCurrentAction('confirmOrder')}
            >
              Odobri narudžbinu
            </Button>
          </Grid>
          <VStack mt={20} align="flex-start" spacing={4} gap={4}>
            {renderContent()}
          </VStack>
        </Box>
        </div>
  )
}
