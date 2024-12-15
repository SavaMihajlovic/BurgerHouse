import React, { useState } from 'react';
import { BsList } from 'react-icons/bs'; 
import styles from './Navbar.module.css';

const Navbar = ({setLoginDialogOpen}) => {
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <>
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
        <ul className={menuOpen? "navbar open" : "navbar"}>
          <li>
            <a href="#home" onClick={handleMenuClick}>
              Početna
            </a>
          </li>
          <li>
            <a href="#about" onClick={handleMenuClick}>
              O nama
            </a>
          </li>
          <li>
            <a href="#menu" onClick={handleMenuClick}>
              Jelovnik
            </a>
          </li>
          <li>
            <a href="#order" onClick={handleMenuClick}>
              Poruči
            </a>
          </li>
          <li>
            <a href="#contact" onClick={handleMenuClick}>
              Kontakt
            </a>
          </li>
          <li>
            <a href="#home" onClick={handleLoginClick}>
              Prijava
            </a>
          </li>
        </ul>
      </header>
    </>
  );
};

export default Navbar;
