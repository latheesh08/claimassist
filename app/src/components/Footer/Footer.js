import React, {	Component } from 'react';
import { Link } from 'react-router-dom';
import './styles.scss';

class Footer extends Component {

	render() {
		return ( 
			<div className="footer-container">
                {this.props.text}
                <Link to={this.props.navLink} className="link-button">{this.props.navTitle}</Link>
			</div>
		);
	}
}

export default Footer;