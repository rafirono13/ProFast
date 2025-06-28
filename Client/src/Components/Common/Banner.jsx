import 'react-responsive-carousel/lib/styles/carousel.min.css';
import BannerImgOne from '../../assets/BannerImg/banner1.png';
import BannerImgTwo from '../../assets/BannerImg/banner2.png';
import BannerImgThree from '../../assets/BannerImg/banner3.png';
import { Carousel } from 'react-responsive-carousel';

const Banner = () => {
  return (
    <div>
      <Carousel
        showArrows={true}
        autoPlay={true}
        infiniteLoop={true}
        interval={2800}
        showThumbs={false}
        showStatus={false}
      >
        <div>
          <img src={BannerImgOne} />
          <p className="legend">Legend 1</p>
        </div>
        <div>
          <img src={BannerImgTwo} />
          <p className="legend">Legend 2</p>
        </div>
        <div>
          <img src={BannerImgThree} />
          <p className="legend">Legend 3</p>
        </div>
      </Carousel>
    </div>
  );
};

export default Banner;
