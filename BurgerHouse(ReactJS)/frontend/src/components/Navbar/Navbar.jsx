import React, { useState, useEffect } from 'react';
import { BsList } from 'react-icons/bs'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from "@/components/ui/avatar"
import styles from './Navbar.module.css';
import axios from 'axios';
import { UserFetch } from '../UserFetch/UserFetch';

const Navbar = ({ setLoginDialogOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState('');
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const pathname = location.pathname;

      if (pathname.startsWith('/kupac')) {
        setRole('Kupac');
      } else if (pathname.startsWith('/administrator')) {
        setRole('Admin');
      } else {
        setRole('');
      }

      const fetchedUser = await UserFetch();
      if (fetchedUser) {
        setUserData(fetchedUser); // Sačuvaj korisničke podatke
      } else {
        navigate('/');
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

  const getMenuItems = () => {

      switch (role) {
        case 'Kupac':
          return (
              <>
                <li><Link to="/kupac" onClick={handleMenuClick}>Početna</Link></li>
                <li><Link to="/kupac-order" onClick={handleMenuClick}>Naruči</Link></li>
                <li><Link to="/kupac-my-orders" onClick={handleMenuClick}>Moje narudžbine</Link></li>
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

        case 'Admin':
          return (
              <>
              </>
              );

        default:
          return (
            <>
                <li><a href="#home" onClick={handleMenuClick}>Početna</a></li>
                <li><a href="#about" onClick={handleMenuClick}>O nama</a></li>
                <li><a href="#menu" onClick={handleMenuClick}>Jelovnik</a></li>
                <li><a href="#order" onClick={handleMenuClick}>Naruči</a></li>
                <li><a href="#contact" onClick={handleMenuClick}>Kontakt</a></li>
                <li><a href="#home" onClick={handleLoginClick}>Prijava</a></li>
            </>
          );
    }
  };

  return (
    <header>
      <a href="#home" className="logo">
        BurgerHouse
      </a>
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
