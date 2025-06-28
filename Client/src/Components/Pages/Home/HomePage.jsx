import Banner from '../../Common/Banner';
import ClientMarquee from './ClientMarquee';
import ServiceSection from './ServiceSection';

const HomePage = () => {
  return (
    <div>
      <Banner></Banner>
      <ServiceSection></ServiceSection>
      <ClientMarquee></ClientMarquee>
    </div>
  );
};

export default HomePage;
