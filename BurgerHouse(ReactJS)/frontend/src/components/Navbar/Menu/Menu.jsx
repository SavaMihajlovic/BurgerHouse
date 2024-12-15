import React from 'react'
import burgers from '../../../img/burgers.png'
import frenchfries from '../../../img/frenchfries.png'
import drinks from '../../../img/drinks.png'

const Menu = () => {
  return (
    <>
        <div className="heading">
            <span>Jelovnik</span>
            <h3>Kategorije proizvoda:</h3>
            </div>
            <div className="menu-container">
            <div className="box">
                <div className="box-img">
                <img src={burgers} alt="Chicken Burger" />
                </div>
                <h2>Burgeri</h2>
                <i className="bx bx-cart"></i>
            </div>

            <div className="box">
                <div className="box-img">
                <img src={frenchfries} alt="Special Veg Burger" />
                </div>
                <h2>Prilozi</h2>
                <i className="bx bx-cart"></i>
            </div>

            <div className="box">
                <div className="box-img">
                <img src={drinks} alt="Chicken Fry Pack" />
                </div>
                <h2>Pića</h2>
                <i className="bx bx-cart"></i>
            </div>
        </div>
    </>
  )
}

export default Menu