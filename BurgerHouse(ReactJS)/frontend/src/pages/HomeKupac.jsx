import React, {useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom';
import homeImg from '../img/home.png'
import Footer from '../components/Navbar/Footer/Footer';
import axios from 'axios';

export const HomeKupac = ({loginDialogOpen,setLoginDialogOpen}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionKey = localStorage.getItem('sessionKey');
  
      if (!sessionKey) {
        navigate('/'); 
        return;
      }

      try {
        const sessionResponse = await axios.get(`http://localhost:5119/User/GetSession/${sessionKey}`);
        const key = sessionResponse.data;
        
        const userResponse = await axios.get(`http://localhost:5119/User/GetUser/${key}`);
        setUser(userResponse.data); 
      } catch (error) {
        console.error('Greška pri učitavanju podataka:', error);
        navigate('/'); 
      }
    };

    fetchUserData();
  }, [navigate]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  const handleOrderClick = () => {
    setLoginDialogOpen(true);
  };

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
