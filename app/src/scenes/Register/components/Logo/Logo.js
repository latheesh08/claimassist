import React, { Component } from 'react';
import logo_img from './images/logo.png';
import './styles.scss';

class Logo extends Component {
    render() {
      return (
        <div className="logo-container">
            <img src={logo_img} alt="Logo"/>
        </div>
      );
    }
}
  
export default Logo;
