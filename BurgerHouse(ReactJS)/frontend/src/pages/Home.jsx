import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import homeImg from '../img/home.png'
import burger1 from '../img/burger1.png'
import Menu from '../components/Navbar/Menu/Menu';
import Footer from '../components/Navbar/Footer/Footer';
import LoginForm from '../components/PrijavaForm/PrijavaForm';
import { HashLink } from 'react-router-hash-link';
import { UserFetch } from '@/components/UserFetch/UserFetch';


export const Home = ({loginDialogOpen,setLoginDialogOpen}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async() => {
      const sessionKey = localStorage.getItem('sessionKey');
      const user = await UserFetch(sessionKey);
      if(user && user.role) {
        if (user.role === 'user') {
          navigate('/kupac');
        } else if (user.role === 'worker') {
          navigate('/radnik');
        } else {
          navigate('/');
        }
      }
      else {
        navigate('/');
      }
    }
    checkUserRole();
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
        {loginDialogOpen && (
            <div className='prijava-container'>
                <LoginForm loginDialogOpen={loginDialogOpen} setLoginDialogOpen={setLoginDialogOpen}/>
            </div>
        )}

        <div className='sekcije'>
        <section className="home" id="home">
            <div className="home-text">
            <h1>Restoran</h1>
            <h2>
                Najukusnija hrana u gradu
            </h2>
            <p>Naši burgeri su pravljeni od svežih i domaćih sastojaka.</p>
            <HashLink to="#about" className="button">
                Više o nama
            </HashLink>
            </div>
            <div className="home-img">
            <img src={homeImg} alt="Home" />
            </div>
        </section>

        <section className="menu" id="menu">
            <Menu />
        </section>

        <section className="order" id="order">
            <div className="order-text">
            <h2>Želite da probate našu ukusnu hranu?</h2>
            <h2>Ne čekajte! </h2>
            <a onClick={handleOrderClick} className="button" style={{cursor:'pointer'}}>
                Naruči odmah
            </a>
            </div>
            <div className="order-img">
            <div className="map-container">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d23221.78370075001!2d21.896636255439343!3d43.320058533871226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ssr!2srs!4v1734026003502!5m2!1ssr!2srs"
                    style={{ border: 0, borderRadius: '15px', width: '100%', height: '100%' }}
                    allowFullScreen
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
            </div>
        </section>

        <section className="about" id="about">
            <div className="about-img">
            <img src={burger1} alt="About" />
            </div>
            <div className="about-text">
            <span>O nama</span>
            <h2>
                Hrana koja zadovoljava <br />
                sva čula
            </h2>
            <p>
            BurgerHouse je osnovan od strane Solution4 kompanije. Naš zadatak je da svakom korisniku pružimo nezaboravno iskustvo uživanja u našoj ukusnoj hrani.
            </p>
            </div>
        </section>
        <Footer/>
        </div> 
    </>
  )
}
