import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import worker from '../img/worker.png'
import Footer from '../components/Navbar/Footer/Footer';
import { UserFetch } from '@/components/UserFetch/UserFetch';

export const HomeRadnik = () => {

   const [user, setUser] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchUserData = async () => {
        const sessionKey = localStorage.getItem('sessionKey');
        const user = await UserFetch(sessionKey);
        if(user && user.role === 'worker') {
          setUser(user);
        } else {
          navigate('/');
        }
      };
  
      fetchUserData();
    }, []);
  
  return (
    <>
    <div className='sekcije'>
    <section className="home" id="home">
        <div className="home-text">
        <h1>Dobrodošao/la, {user?.firstname} {user?.lastname}</h1>
        <h2>
            Hvala ti što si deo našeg tima!
        </h2>
        <p> Zajedno stvaramo najbolje iskustvo za naše goste.</p>
        </div>
        <div className="home-img">
        <img src={worker} alt="Home" style={{ width: '300px', height: 'auto' }}  />
        </div>
    </section>
    <Footer/>
    </div> 
</>
  )
}
