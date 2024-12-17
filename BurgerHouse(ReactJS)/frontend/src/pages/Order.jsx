import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../components/Navbar/Menu/Menu.module.css';

export const Order = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // Dobijamo niz stringova
        const allItemsResponse = await axios.get('http://localhost:5119/MenuItem/ReadAllItems');
        const allItems = allItemsResponse.data;

        // Mapiramo niz stringova i izvlačimo deo posle "menu:"
        const itemDetailsPromises = allItems.map(async (item) => {
          const parts = item.split(':');
          const itemName = parts.slice(1).join(':'); 

          console.log(itemName);

          if (!itemName) {
            console.error(`Invalid item format: ${item}`);
            return null;
          }

          const itemDetailsResponse = await axios.get(`http://localhost:5119/MenuItem/ReadItem?name=${itemName}`);
          console.log(itemDetailsResponse.data);
          return itemDetailsResponse.data;
        });

        const detailedItems = await Promise.all(itemDetailsPromises);
        
        setItems(detailedItems.filter((item) => item !== null));
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  return (

    <section>
    <div className="items-container">
      <h3 style={{ marginTop: '20px', fontWeight: 'bold' }}>Ponuda:</h3>
      <div className="menu-container">
        {items.map((item, index) => (
          <div key={index} className={`${styles.menubox}`}>
            <h2>{item.name}</h2>
            <i className="bx bx-cart"></i>
          </div>
        ))}
      </div>
    </div>
    </section>
  );
};
