import React, { useState } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ onImageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleImageSelect = (deckIndex, imageName) => {
    onImageChange(deckIndex, imageName);
  };

  return (
    <div className="hamburger-menu">
      <button className={`hamburger-button ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`menu-container ${isOpen ? 'open' : ''}`}>
        <div className="menu-overlay" onClick={toggleMenu}></div>
        <div className={`menu-items ${isOpen ? 'open' : ''}`}>
          <ul>
            <li>
              Record 1:
              <select onChange={(e) => handleImageSelect(0, e.target.value)}>
                <option value="disc_cover_1.jpg">Red</option>
                <option value="disc_cover_2.jpg">Green</option>
                <option value="disc_cover_3.jpg">Blue</option>
              </select>
            </li>
            <li>
              Record 2:
              <select onChange={(e) => handleImageSelect(1, e.target.value)}>
                <option value="disc_cover_1.jpg">Red</option>
                <option value="disc_cover_2.jpg">Green</option>
                <option value="disc_cover_3.jpg">Blue</option>
              </select>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;