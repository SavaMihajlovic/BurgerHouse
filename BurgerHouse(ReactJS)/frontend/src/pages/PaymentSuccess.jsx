import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { Box, Text, Button, VStack } from '@chakra-ui/react';

export const PaymentSuccess = () => {
  const location = useLocation();
  const hasRun = useRef(false);  
  const navigate = useNavigate();

  useEffect(() => {
    if (hasRun.current) return;  

    const confirmOrderAndAddMoney = async () => {
      const url = location.search;
      const params = new URLSearchParams(url.split('?')[1]);
      const token = params.get('token');
      const user = params.get('user');
      const ammount = params.get('ammount');

      if (!token || !user || !ammount) {
        navigate('/');  
        return;
      }

      try {
        const responseConfirmOrder = await axios.post(`http://localhost:5119/Paypal/ConfirmOrder/${token}`);
        if(responseConfirmOrder.status === 200) {
            const addMoneyResponse = await axios.put('http://localhost:5119/User/AddMoney', {
                user: user,
                ammount: parseFloat(ammount)
            });

            if(addMoneyResponse.status === 200) {
                alert('Uspešno ste uplatili novac na vašem nalogu!');
                navigate('/payment-success');
            } else {
                alert('Greška prilikom uplate novca na vašem nalogu!');
                navigate('/payment-failure');   
            }
        } else {
            console.error('Nije moguće potvrditi plaćanje.');
        }
        
      } catch(error) {
        alert('Greška pri uplati:', error);
        navigate('/payment-failure'); 
      }
    }

    confirmOrderAndAddMoney();
    hasRun.current = true;  // Obeležava da je kod već izvršen
  }, [location]);

  const handleRedirect = () => {
    navigate('/');  
  };

  return (
    <>
        <section>
            <Box textAlign="center" p={8}>
                <VStack spacing={4}>
                    <Box color="green.500">
                    <MdCheckCircle size={80} />
                    </Box>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    Uspešno plaćanje
                    </Text>
                    <Text fontSize="lg" marginBottom={5}>
                    Vaša uplata je uspešno procesuirana. Hvala na kupovini!
                    </Text>
                    <Button className='button' onClick={handleRedirect} >Povratak na početnu stranicu </Button>
                </VStack>
            </Box>
        </section>
    </>
  );
};
