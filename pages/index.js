/* eslint-disable @next/next/no-img-element */
import NextLink from 'next/link';
import { Grid, Link, Typography } from '@material-ui/core';
import Layout from '../components/Layout';
import db from '../utils/db';
import Product from '../models/Product';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Store } from '../utils/Store';
import ProductItem from '../components/ProductItem';
import Carousel from 'react-material-ui-carousel';
import useStyles from '../utils/styles';




// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y, Autoplay, EffectCoverflow, EffectCube } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';




export default function Home(props) {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { topRatedProducts, featuredProducts } = props;
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };
  return (
    <Layout>

      <Carousel className={classes.mt1} animation="slide">
        {featuredProducts.map((product) => (
          <NextLink
            key={product._id}
            href={`/product/${product.slug}`}
            passHref
          >
            <Link>
              <img
                src={product.featuredImage}
                alt={product.name}
                className={classes.featuredImage}
              ></img>
            </Link>
          </NextLink>
        ))}
      </Carousel>





      <Swiper className="container" style={{ padding: "1rem 0 2.5rem 0" }}
        // id="swiper-color"
        // install Swiper modules
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay, EffectCoverflow, EffectCube]}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 20,
            // width: 320
          },
          // when window width is >= 480px
          480: {
            slidesPerView: 1,
            spaceBetween: 30
          },
          // when window width is >= 640px
          640: {
            slidesPerView: 3,
            spaceBetween: 40,
          }
        }}
        autoplay
        updateOnWindowResize
        effect="coverflow"
        // spaceBetween={5}
        // slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        loop="true"
        // scrollbar={{ draggable: true }}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
      >

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SwiperSlide className="carouselImage"><img src="images/1.jpg" alt="recentPostCarousel" width={400} /></SwiperSlide>
          <SwiperSlide className="carouselImage"><img src="images/2.jpg" alt="recentPostCarousel" width={400} /></SwiperSlide>
          <SwiperSlide className="carouselImage"><img src="images/3.jpg" alt="recentPostCarousel" width={400} /></SwiperSlide>
          <SwiperSlide className="carouselImage"><img src="images/4.jpg" alt="recentPostCarousel" width={400} /></SwiperSlide>
          <SwiperSlide className="carouselImage"><img src="images/5.jpg" alt="recentPostCarousel" width={400} /></SwiperSlide>
          <SwiperSlide className="carouselImage"><img src="images/6.jpg" alt="recentPostCarousel" width={400} /></SwiperSlide>
        </div>

      </Swiper>





      <Typography style={{ fontFamily: "Marcellus SC", textAlign: "center", fontSize: "3rem", marginTop: "3.5vw", marginBottom: "2vw", lineHeight: "2.8rem" }}>Popular Products</Typography>
      {/* <img src="/shirt1.jpg" /> */}
      <Grid container spacing={3}>
        {topRatedProducts.map((product) => (
          <Grid item md={4} key={product.name}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
            />
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    '-reviews'
  )
    .lean()
    .limit(3);
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6);
  await db.disconnect();
  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
    },
  };
}
