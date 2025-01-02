import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCancel } from 'react-icons/md';  
import { Box, Text, Button, VStack } from '@chakra-ui/react';  

export const PaymentFailure = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/');  
  };

  return (
    <section>
        <Box textAlign="center" p={8}>
        <VStack spacing={4}>
            <Box color="red.500">
            <MdCancel size={80} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
            Neuspešno plaćanje
            </Text>
            <Text fontSize="lg" marginBottom={5}>
            Došlo je do greške prilikom obrade uplate. Pokušajte ponovo.
            </Text>
            <Button className='button' onClick={handleRedirect}>Povratak na početnu stranicu </Button>
        </VStack>
        </Box>
    </section>
  );
};
