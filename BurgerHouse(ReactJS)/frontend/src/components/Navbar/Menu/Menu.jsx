import React, {useState} from 'react'
import axios from 'axios';
import burgers from '../../../img/burgers.png'
import frenchfries from '../../../img/frenchfries.png'
import drinks from '../../../img/drinks.png'
import styles from '../Menu/Menu.module.css';


const Menu = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [items, setItems] = useState([]); 

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        let endpoint = '';

        switch(category) {
            case "Burgeri":
                endpoint = 'http://localhost:5119/MenuItem/ReadAllSpecific/burger';
                break;
            case "Prilozi":
                endpoint = 'http://localhost:5119/MenuItem/ReadAllSpecific/fries';
                break;
            case "Sokovi":
                endpoint = 'http://localhost:5119/MenuItem/ReadAllSpecific/drinks';
                break;
            default:
                return;
        }

        try {
          const response = await axios.get(endpoint);
          const formattedItems = response.data.map(item => {
            return {
              category: item.key,
              name: item.name
            };
          });
          setItems(formattedItems);

        } catch (error) {
          console.error('Greška pri pribavljanju proizvoda:', error);
        }
      };    


  return (
    <>
        <div className="heading">
            <span>Jelovnik</span>
            <h3>Kategorije proizvoda:</h3>
            </div>
            <div className="menu-container">
            <div className="box" onClick={() => handleCategoryClick('Burgeri')}>
                <div className="box-img">
                <img src={burgers} alt="Chicken Burger" />
                </div>
                <h2>Burgeri</h2>
                <i className="bx bx-cart"></i>
            </div>

            <div className="box" onClick={() => handleCategoryClick('Prilozi')}>
                <div className="box-img">
                <img src={frenchfries} alt="Special Veg Burger" />
                </div>
                <h2>Prilozi</h2>
                <i className="bx bx-cart"></i>
            </div>

            <div className="box" onClick={() => handleCategoryClick('Sokovi')}>
                <div className="box-img">
                <img src={drinks} alt="Chicken Fry Pack" />
                </div>
                <h2>Pića</h2>
                <i className="bx bx-cart"></i>
            </div>
        </div>

        {selectedCategory && (
        <div className="items-container">
          <h3 style={{marginTop: "20px", fontWeight: "bold"}}>Kategorija: {selectedCategory}</h3>
          <div className="menu-container">
            {items.map((item, index) => (
              <div key={index} className={`${styles.menubox}`}>
                <h2>{item.name}</h2>
                <i className="bx bx-cart"></i>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default Menu