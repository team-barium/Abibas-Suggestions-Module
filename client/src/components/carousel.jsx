import React from 'react';
import axios from 'axios';
import styles from '../styles/carousel.css';
import Item from './item.jsx';
import Indicator from './indicator.jsx'

class Carousel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			currId: null,
			position: 0,
			direction: 'next',
			sliding: false
		}
		this.getSuggestions = this.getSuggestions.bind(this);
		this.shuffle = this.shuffle.bind(this);
		this.getOrder = this.getOrder.bind(this);
		this.nextSlide = this.nextSlide.bind(this);
		this.prevSlide = this.prevSlide.bind(this);
		this.slide = this.slide.bind(this);
		this.changePosition = this.changePosition.bind(this);
	}

	componentDidMount() {
		const {id} = this.props;

		this.setState(
			{ currId: parseInt(id) },
			() => this.getSuggestions()
		);
	}

	getSuggestions() {
		console.log(this.state.currId, 'get id')
		let { currId } = this.state;
		axios
			.get('http://localhost:8080/suggestions', {
				params: {
					id: currId
				}
			})
			.then(({ data }) => {
				let shuffled = this.shuffle(data)
				this.setState({ data: shuffled })
			})
			.catch(err => console.log('axios get error', err))
	}

	shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	getOrder(itemIndex) {
		const { position } = this.state
		const { data } = this.state
		const numItems = data.length || 1;

		if (itemIndex - position < 0) {
			return numItems - Math.abs(itemIndex - position)
		}
		return itemIndex - position
	}


	nextSlide() {
		const { position } = this.state;
		const { data } = this.state;

		this.slide('next', position + 4)
	}

	prevSlide() {
		const { position } = this.state;
		const { data } = this.state;

		this.slide('prev', position - 4)
	}

	slide(direction, position) {
		this.setState({
			sliding: true,
			direction,
			position
		})
		setTimeout(() => {
			this.setState({
				sliding: false
			})
		}, 50)
	}

	changePosition(index) {
		const { position } = this.state;
		const pageIndex = index * 4;
		if (pageIndex > position) {
			this.slide('next', pageIndex);
		} else if (pageIndex < position) {
			this.slide('prev', pageIndex);
		}
	}

	render() {
		let data = this.state.data.slice(0, 12);
		let { sliding } = this.state;
		let { direction } = this.state;
		let { position } = this.state;

		const caroTransform = () => {
			if (!sliding) return 'translateX(calc(0% - 849px))'
    	if (direction === 'prev') return 'translateX(calc(2 * (-0% - 849px)))'
    	return 'translateX(0%)'
		}

		const carouselStyling = {
			display: 'flex',
			maxWidth: '849px',
			// margin: '0 0 20px 20px',
			transition: `${sliding ? 'none' : 'transform 0.3s ease'}`,
			transform: `${caroTransform()}`
		}

		const prevArrow = () => position !== 0 ? (<a className={styles.prev} onClick={this.prevSlide}>&#10094;</a>) : null;

		const nextArrow = () => position < 12 ? (<a className={styles.next} onClick={this.nextSlide}>&#10095;</a>) : null;

		if (data.length > 0) {
			return (
				<div>
					<div className={styles.wrapper}>
						<div className={styles.carousel} style={carouselStyling} >
							{data.map((obj, i) => {
								return <Item key={i} obj={obj} order={this.getOrder(i)} />
							})}
						</div><br />
						{prevArrow()}
						{nextArrow()}
						<Indicator position={this.state.position} changePosition={this.changePosition} />
					</div>
				</div>
			)
		} else {
			return <div></div>
		}
	}
}

export default Carousel;