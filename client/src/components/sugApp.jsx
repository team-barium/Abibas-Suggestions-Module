import React from 'react';
import styles from '../styles/sugApp.css';
import Carousel from './carousel.1.jsx';

const App = (props) => {
	return (
		<div className={styles.container}>
			<Carousel />
		</div>
	);
};

export default App;