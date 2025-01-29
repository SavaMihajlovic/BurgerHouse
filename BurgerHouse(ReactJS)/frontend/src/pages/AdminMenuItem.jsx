import React, { useState } from 'react'
import { Text, Input, Box, Grid, VStack, HStack } from "@chakra-ui/react"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Button } from "@/components/ui/button"
import axios from 'axios'

export const AdminMenuItem = () => {

  const menuItemTypes = ['burger','fries','drinks'];
  const [currentAction, setCurrentAction] = useState('read');

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [menuItemKey, setMenuItemKey] = useState('');
  const [menuItem, setMenuItem] = useState(null);
  const [menuItemsSpecific, setMenuItemsSpecific] = useState([]);
  const [menuItemsAll, setMenuItemsAll] = useState([]);
  const [awardsValue, setAwardsValue] = useState('');
  const [actors, setActors] = useState([]);

  const handleAddMenuItem = async () => {
    try {
      const response = await axios.post(`http://localhost:5119/MenuItem/AddItem/${selectedType}`, {
        name,
        price,
        description
      });

      if (response.status === 200) {
        alert(`Uspešno dodavanje stavke: ${name}`);
      }
    } catch (error) {
      console.error('Error adding MenuItem:', error);
    }
  };

  const handleUpdateMenuItem = async () => {
    try {
      const response = await axios.put(`http://localhost:5119/MenuItem/UpdateItem/${menuItemKey}`, {
        name,
        price,
        description
      });

      if (response.status === 200) {
        alert(`Uspešno ažuriranje stavke ${name}`);
      }
    } catch (error) {
      console.error('Error updating MenuItem:', error);
    }
  };

  const handleReadMenuItem = async () => {
    try {
    const response = await axios.get(`http://localhost:5119/MenuItem/ReadItem/${menuItemKey}`);
    if (response.status === 200) {
        setMenuItem(response.data);
    }
    } catch (error) {
      console.error('Error fetching MenuItem:', error);
    }
  };

  const handleReadAll = async () => {
    try {
    const response = await axios.get(`http://localhost:5119/MenuItem/ReadAllItems`);
    if (response.status === 200) {
        setMenuItemsAll(response.data);
        setCurrentAction('readAll');
    }
    } catch (error) {
      console.error('Error fetching all MenuItems:', error);
    }
  };

  const handleReadAllSpecific = async () => {
    try {
    const response = await axios.get(`http://localhost:5119/MenuItem/ReadAllSpecific/${selectedType}`);
    if (response.status === 200) {
        setMenuItemsSpecific(response.data);
    }
    } catch (error) {
      console.error('Error fetching specific MenuItems:', error);
    }
  };

  const handleDeleteMenuItem = async () => {
    try {
      const response = await axios.delete(`http://localhost:5119/MenuItem/DeleteItem/${menuItemKey}`);
        if(response.status === 200) {
            alert(`Uspešno brisanje stavke sa menija: ${menuItem.name}`);
        }
    } catch (error) {
        console.error("Error deleting MenuItem.");
    }
  }

  const renderContent = () => {
      switch (currentAction) {
        case 'create':
          return (
            <>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Naziv stavke :</Text>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Cena stavke :</Text>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Opis :</Text>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack>
                <RadioGroup 
                onChange={(e) => setSelectedType(e.target.value)}
                colorPalette='blue'>
                    {menuItemTypes.map((menuItem) => (
                    <Radio key={menuItem} value={menuItem} colorScheme="blue" mr={5}>{menuItem}</Radio>
                    ))}
                </RadioGroup>
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
                  onClick={handleAddMenuItem} 
                >
                  Dodaj
                </Button>
              </HStack>
            </>
          );
        case 'read':
          return(
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
                    placeholder='menu:type:name'
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
                  onClick={handleReadMenuItem} 
                >
                  Vrati stavku
                </Button>
            </HStack>

            {menuItem && (
            <VStack mt={10} display='flex' alignItems='flex-start'>
                <Text fontSize="lg" color="white">Naziv: {menuItem.name}</Text>
                <Text fontSize="lg" color="white">Cena: {menuItem.price} RSD</Text>
                <Text fontSize="lg" color="white">Opis: {menuItem.description}</Text>
            </VStack>
            )}
          </>
          );
        case 'readAll' :
            return(
            <>
                <VStack mt={10} display='flex' alignItems='flex-start'>
                {menuItemsAll.map((item,index) => {
                            return <Text key={index}>{item}</Text>
                })}
                </VStack>
            </>
            );
        case 'readSpecific' :
            return(
            <>
                <HStack>
                    <RadioGroup 
                    onChange={(e) => setSelectedType(e.target.value)}
                    colorPalette='blue'>
                        {menuItemTypes.map((menuItem) => (
                        <Radio key={menuItem} value={menuItem} colorScheme="blue" mr={5}>{menuItem}</Radio>
                        ))}
                    </RadioGroup>
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
                    onClick={handleReadAllSpecific} 
                    >
                    Vrati stavke
                    </Button>
                </HStack>

                {menuItemsSpecific && (
                    <VStack mt={10} display='flex' alignItems='flex-start'>
                        {menuItemsSpecific.map((item, index) => (
                        <Text key={index}>
                            {item.key}: {item.name}
                        </Text>
                        ))}
                    </VStack>
                )}
            </>
            );
        case 'update':
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
                <Text width="150px">Naziv stavke :</Text>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Cena stavke :</Text>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  width="25%"
                  color='white'
                  p={3}
                  bg='#2a2629'
                />
              </HStack>
              <HStack width="100%" spacing={4}>
                <Text width="150px">Opis :</Text>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  onClick={handleUpdateMenuItem} 
                >
                  Ažuriraj
                </Button>
              </HStack>
            </>
          );
        case 'delete':
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
              Dodaj stavku
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
              onClick={() => setCurrentAction('read')}
            >
              Vrati stavku sa menija
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
              onClick={() => setCurrentAction('readSpecific')}
            >
              Vrati specifične stavke
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
              onClick={handleReadAll}
            >
              Vrati sve stavke
            </Button>
            <Button
              padding={3}
              backgroundColor='#fca130'
              variant="solid"
              _hover={{
                bg: '#e58f28 ',
                color: 'white',
                boxShadow: 'md',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={() => setCurrentAction('update')}
            >
              Ažuriraj stavku
            </Button>
            <Button 
              padding={3}
              colorPalette="red"
              variant="solid"
              _hover={{
                bg: 'dark-red',
                color: 'white',
                boxShadow: 'md',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
              }}
              onClick={() => setCurrentAction('delete')}
            >
              Obriši stavku sa menija
            </Button>
          </Grid>
          <VStack mt={20} align="flex-start" spacing={4} gap={4}>
            {renderContent()}
          </VStack>
        </Box>
        </div>
  )
}
