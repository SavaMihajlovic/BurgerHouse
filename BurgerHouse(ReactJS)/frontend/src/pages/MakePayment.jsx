import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import paypal from '../img/paypal.png'
import Footer from '../components/Navbar/Footer/Footer';
import axios from 'axios';
import { UserFetch } from '@/components/UserFetch/UserFetch';
import { Button, Input, VStack } from '@chakra-ui/react';


export const MakePayment = () => {
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      const sessionKey = localStorage.getItem('sessionKey');  
      const user = await UserFetch(sessionKey); 
      console.log(user);
  
      if (user) {
        const response = await axios.post('http://localhost:5119/Paypal/MakePayment', {
          user: `user:${user.userEmail}`,
          ammount: parseFloat(amount),
        });
        
        if (response.data) {
          window.location.href = response.data;
        } else {
          alert('Nije moguće izvršiti uplatu.');
        }
      } else {
        alert('Korisnik nije ulogovan!');
      }
    } catch (error) {
      console.error('Greška pri uplati:', error);
    }
  };
  
  return (
    <>
        <div className='sekcije'>
        <section className="home" id="home">
            <div className="home-text">
            <h1>Uplati novac</h1>
            <h2>
                Dodaj sredstva na računu putem PayPal metode.
            </h2>
            <VStack spacing={4} width="100%" maxW="300px">
                <Input
                placeholder="Unesite iznos"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                size="md"
                min={0}
                step={10}
                _focus={{ borderColor: 'blue.500' }} 
                backgroundColor={'white'}
                color={'black'}
                padding={3}
                mb={3}
                />
                <Button
                className="button"
                colorScheme="blue"
                fontSize={13}
                fontWeight={'bold'}
                width="100%"
                onClick={handlePayment}
                >
                Uplati
                </Button>
            </VStack>
            </div>
            <div className="home-img">
            <img src={paypal} alt="PayPal" style={{ width: '250px', height: 'auto', marginLeft: '50px' }} />
            </div>
        </section>
        <Footer/>
        </div> 
    </>
  )
}
