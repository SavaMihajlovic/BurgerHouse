import React, { useState, useEffect } from 'react';
import { BsList } from 'react-icons/bs'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from "@/components/ui/avatar"
import styles from './Navbar.module.css';
import axios from 'axios';
import { UserFetch } from '../UserFetch/UserFetch';
import { HashLink } from 'react-router-hash-link';
import { Box, Input, Button } from '@chakra-ui/react';

const Navbar = ({ setLoginDialogOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState('');
  const [amount, setAmount] = useState('');
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {

      const sessionKey = localStorage.getItem('sessionKey');
      const user = await UserFetch(sessionKey);
      if (user && user.role) {
        setUserData(user);
        if (user.role === "user") {
          setRole('Kupac');
        } else if (user.role === "worker") {
          setRole('Radnik');
        } else if (user.role === "admin") {
          setRole('Admin');
        } else {
          setRole('');
        }
      } else {
        setRole('');
        setUserData(null);
      }
    };

    fetchUserData();
  }, [location, navigate]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    setMenuOpen(false);
    setLoginDialogOpen(true);
  };

  const handleLogout = async () => {
    const sessionKey = localStorage.getItem('sessionKey');
    if (sessionKey) {
      try {
        const response = await axios.post(`http://localhost:5119/User/Logout/${sessionKey}`);
        console.log('Odjava uspešna:', response.data); 
      } catch (error) {
        console.error('Greška pri odjavi:', error);
        alert('Došlo je do greške prilikom odjave. Pokušajte ponovo.');
      } finally {
        localStorage.removeItem('sessionKey');
        navigate('/');
      }
    }
  }

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://localhost:5119/Paypal/MakePayment', {
        user: userData?.username || 'unknown',
        ammount: parseFloat(amount),
      });
      if (response.data && response.data.link) {
        navigate(response.data.link);
      } else {
        alert('Nije moguće izvršiti uplatu.');
      }
    } catch (error) {
      console.error('Greška pri uplati:', error);
      alert('Došlo je do greške prilikom obrade uplate.');
    }
  };

  const getMenuItems = () => {

      switch (role) {
        case 'Kupac':
          return (
              <>
                <li><Link to="/kupac" onClick={handleMenuClick}>Početna</Link></li>
                <li><Link to="/kupac-order" onClick={handleMenuClick}>Naruči</Link></li>
                <li><Link to="/kupac-my-orders" onClick={handleMenuClick}>Moje narudžbine</Link></li>
                <li><Link to="/kupac-make-payment" onClick={handleMenuClick}>Uplati novac</Link></li>
                <li><Link to="/" onClick={handleLogout}>Odjava</Link></li>
                {menuOpen === false && (
                <li className={styles.avatarContainer}>
                  <Avatar
                    className={styles['avatar-padding']}
                    size="sm"
                    variant="subtle"
                    name={`${userData?.firstname || ''} ${userData?.lastname || ''}`}
                  />
                  <span className={styles.balance}>Balans: {userData?.digitalcurrency} RSD</span>
                </li>
                )}
              </>
          );  

        case 'Radnik':
          return (
              <>
                <li><Link to="/radnik" onClick={handleMenuClick}>Početna</Link></li>
                <li><Link to="/radnik-orders-view" onClick={handleMenuClick}>Pregled narudžbina</Link></li>
                <li><Link to="/" onClick={handleLogout}>Odjava</Link></li>
              </>
              );
        case 'Admin':
          return (
              <>
                <li><Link to="/admin" onClick={handleMenuClick}>MenuItem</Link></li>
                <li><Link to="/admin-order" onClick={handleMenuClick}>Order</Link></li>
                <li><Link to="/" onClick={handleLogout}>Odjava</Link></li>
                {menuOpen === false && (
                <li className={styles.avatarContainer}>
                  <Avatar
                    className={styles['avatar-padding']}
                    size="sm"
                    variant="subtle"
                    name={`${userData?.firstname || ''} ${userData?.lastname || ''}`}
                  />
                   <span className={styles.userData}><strong>{userData.firstname} {userData.lastname}</strong></span>
                </li>
                )}
              </>
              );

        default:
          return (
            <>
                <li><HashLink to="#home" onClick={handleMenuClick}>Početna</HashLink></li>
                <li><HashLink to="#about" onClick={handleMenuClick}>O nama</HashLink></li>
                <li><HashLink to="#menu" onClick={handleMenuClick}>Jelovnik</HashLink></li>
                <li><HashLink to="#order" onClick={handleMenuClick}>Naruči</HashLink></li>
                <li><HashLink to="#contact" onClick={handleMenuClick}>Kontakt</HashLink></li>
                <li><HashLink to="#home" onClick={handleLoginClick}>Prijava</HashLink></li>
            </>
          );
    }
  };

  return (
    <header>
      <HashLink to="#home" className="logo">
        BurgerHouse
      </HashLink>
      <div
        className={`${styles.burgerMenu} bx bx-menu ${menuOpen ? "open" : ""}`}
        id="menu-icon"
        onClick={toggleMenu}
      >
        <BsList className={`${styles.svgIcon}`} />
      </div>
      <ul className={menuOpen ? "navbar open" : "navbar"}>
        {getMenuItems()}
      </ul>
    </header>
  );
};

export default Navbar;
