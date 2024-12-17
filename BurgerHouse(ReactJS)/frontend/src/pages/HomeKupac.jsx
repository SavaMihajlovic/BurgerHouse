import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import homeImg from '../img/home.png'
import Footer from '../components/Navbar/Footer/Footer';

export const HomeKupac = ({loginDialogOpen,setLoginDialogOpen}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
            <h1>Dobrodošao</h1>
            <h2>
                Najukusnija hrana u gradu
            </h2>
            <p>Naši burgeri su pravljeni od svežih i domaćih sastojaka.</p>
            <a href="#about" className="button">
                Više o nama
            </a>
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
