import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom';
import homeImg from '../img/home.png'
import Footer from '../components/Navbar/Footer/Footer';
import axios from 'axios';
import { UserFetch } from '@/components/UserFetch/UserFetch';

export const HomeKupac = ({loginDialogOpen,setLoginDialogOpen}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionKey = localStorage.getItem('sessionKey');
      const user = await UserFetch(sessionKey);
      if(user && user.role === 'user') {
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
                Najukusnija hrana u gradu
            </h2>
            <p>Naši burgeri su pravljeni od svežih i domaćih sastojaka.</p>
            <Link to="/kupac-order" className="button">
                Naruči odmah
            </Link>
            </div>
            <div className="home-img">
            <img src={homeImg} alt="Home" />
            </div>
        </section>
        <Footer/>
        </div> 
    </>
  )
}
