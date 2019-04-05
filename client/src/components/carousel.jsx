import React from 'react';
import axios from 'axios';
import styles from '../styles/carousel.css';
import Item from './item.jsx';
import Indicator from './indicator.jsx';
import { Swipeable } from 'react-swipeable';
import { throttle } from 'lodash';

class Carousel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			// currId: null,
			currId: Math.ceil(Math.random() * 19),
			position: 0,
			direction: 'next',
			sliding: false,
			width: 0,
			showing: 4
		};
		this.updateWindowWidth = this.updateWindowWidth.bind(this);
		this.getSuggestions = this.getSuggestions.bind(this);
		this.shuffle = this.shuffle.bind(this);
		this.getOrder = this.getOrder.bind(this);
		this.nextSlide = this.nextSlide.bind(this);
		this.prevSlide = this.prevSlide.bind(this);
		this.slide = this.slide.bind(this);
		this.changePosition = this.changePosition.bind(this);
		// this.handleSwipe = this.handleSwipe.bind(this);
	}

	componentDidMount() {
		this.updateWindowWidth();
		this.getSuggestions();
		window.addEventListener('resize', this.updateWindowWidth);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateWindowWidth);
	}

	updateWindowWidth() {
		let { position } = this.state;
		this.setState({ width: window.innerWidth }, () => {
			if (this.state.width <= 960) {
				this.setState({ showing: 2 })
			} else {
				if (position % 4 !== 0) {
					this.setState({ position: this.state.position - 2 })
				}
				this.setState({ showing: 4 })
			}
		});
	}

	getSuggestions() {
		let { currId } = this.state;
		axios
			.get('/suggestions', {
				params: {
					id: currId
				}
			})
			.then(({ data }) => {
				let shuffled = this.shuffle(data);
				this.setState({ data: shuffled });
			})
			.catch(err => console.log('axios get error', err));
	}

	shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	getOrder(itemIndex) {
		const { position } = this.state;
		const { data } = this.state;
		const numItems = data.length || 1;

		if (itemIndex - position < 0) {
			return numItems - Math.abs(itemIndex - position);
		}
		return itemIndex - position;
	}


	nextSlide() {
		const { position, showing } = this.state;
		this.slide('next', position + showing);
	}

	prevSlide() {
		const { position, showing } = this.state;
		this.slide('prev', position - showing);
	}

	slide(direction, position) {
		this.setState({
			sliding: true,
			direction,
			position
		});
		setTimeout(() => {
			this.setState({
				sliding: false
			});
		}, 50);
	}

	changePosition(index) {
		const { position, showing } = this.state;
		const pageIndex = index * showing;
		if (pageIndex > position) {
			this.slide('next', pageIndex);
		} else if (pageIndex < position) {
			this.slide('prev', pageIndex);
		}
	}

	// handleSwipe(isNext) {
	// 	console.log('handling swipe')
	// 	if (isNext) {
	// 		this.nextSlide();
	// 	} else {
	// 		this.prevSlide();
	// 	}
	// }

	render() {
		let data = this.state.data.slice(0, 16);
		let { sliding, direction, showing, position, width } = this.state;

		let caroTransform = () => {
			if (width <= 960) {
				if (!sliding) return 'translateX(calc(0% - 88%))';
				if (direction === 'prev') return 'translateX(calc(2*(-0% - 88%)))';
				return 'translateX(0%)'
			} else {
				if (!sliding) return 'translateX(calc(0% - 100%))';
				if (direction === 'prev') return 'translateX(calc(2 * (-0% - 100%)))';
				return 'translateX(0%)';
			}
		};

		let carouselStyling = {
			transition: `${sliding ? 'none' : 'transform 0.3s ease'}`,
			transform: `${caroTransform()}`
		};

		if (data.length > 0) {
			return (
				<div className={styles.gutter}>
					<div className={styles.wrapper}>
						<div className={styles.headingWrapper}>
							<div className={styles.heading}>You may also like</div>
						</div>
						{/* <Swipeable
							// onSwipingLeft={ () => throttle(this.handleSwipe(true), 500, { trailing: false }) }
							// onSwipingRight={ () => throttle(this.handleSwipe(), 500, { trailing: false }) }
							onSwipingLeft={() => this.handleSwipe(true)}
							onSwipingRight={() => this.handleSwipe()}
						> */}
							<div className={styles.carousel} style={carouselStyling} >
								{data.map((obj, i) => {
									return <Item key={i} obj={obj} order={this.getOrder(i)} />;
								})}
							</div>
						{/* </Swipeable> */}
							<Indicator position={position} changePosition={this.changePosition} nextSlide={this.nextSlide} prevSlide={this.prevSlide} showing={showing} />
					</div>
				</div>
			);
		} else {
			return <div></div>;
		}
	}
}

export default Carousel;