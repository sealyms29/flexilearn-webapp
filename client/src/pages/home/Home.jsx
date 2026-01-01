import React from 'react'
import "./Home.scss"
import Featured from '../../components/featured/Featured'
import TrustedBy from '../../components/trustedBy/TrustedBy'
import Slide from '../../components/slide/Slide'
import CatCard from '../../components/catCard/CatCard';
import { cards, projects } from '../../data';
import ProjectCard from '../../components/projectCard/ProjectCard'
import GigCard from '../../components/gigCard/GigCard'
import { useQuery } from '@tanstack/react-query'
import newRequest from '../../utils/newRequest'

const Home = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["gigs"],
    queryFn: () =>
      newRequest
        .get("/gigs?sort=sales")
        .then((res) => {
          return res.data;
        })
        .catch((error) => {
          console.error('Error fetching gigs:', error);
          throw error;
        }),
  });

  return (
    <div className='home'>
        <Featured/>
        <TrustedBy/>
        <Slide slidesToShow={3} arrowsScroll={3}>
          {
            cards.map(card=>(
              <CatCard key={card.id} item={card}/>
            ))
          }
        </Slide>

        {!isLoading && !error && data && data.length > 0 && (
          <>
            <div style={{padding: '20px', textAlign: 'center'}}>
              <h2>Popular Services</h2>
            </div>
            <Slide slidesToShow={3} arrowsScroll={3}>
              {
                data.slice(0, 8).map(gig=>(
                  <GigCard key={gig._id} item={gig}/>
                ))
              }
            </Slide>
          </>
        )}
        {isLoading && (
          <div style={{padding: '20px', textAlign: 'center'}}>
            <h2>Popular Services</h2>
            <p>Loading services...</p>
          </div>
        )}
        {!isLoading && error && (
          <div style={{padding: '20px', textAlign: 'center'}}>
            <h2>Popular Services</h2>
            <p>Unable to load services at this time</p>
          </div>
        )}

        <div className='features'>
          <div className="container">
             <div className="item">
                  <h1>A whole world of freelance talent at your fingertips</h1>
                   
                <div className="title">
                  <div className="title2">
                    <img src='./img/check.png' alt=''/>
                        The best for every budget
                  </div>

                   <p>
                    Find high-quality services at every price point. No hourly rates,
                    just project-based pricing.
                   </p>
                </div>

                <div className="title">
                  <div className="title2">
                    <img src='./img/check.png' alt=''/>
                      Quality work done quickly
                  </div>
                   <p>
                    Find the right freelancer to begin working on your project within
                    minutes.
                   </p>
                </div>

                <div className="title">
                  <div className="title2">
                    <img src='./img/check.png' alt=''/>
                      Protected payments, every time
                  </div>
                   <p>
                    Always know what you'll pay upfront. Your payment isn't released
                    until you approve the work.
                   </p>
                </div>

                <div className="title">
                  <div className="title2">
                    <img src='./img/check.png' alt=''/>
                      24/7 support
                  </div>
  
                   <p>
                    Find high-quality services at every price point. No hourly rates,
                    just project-based pricing.
                   </p>
                </div>

             </div>
             

          </div>
        </div>

        <div className='features dark'>
          <div className="container">
            <div className="item">
              <h1>FlexiLearn</h1>
              <hr/>
              <h2>A business solution designed for teams</h2>
              <p>
                Upgrade to a curated experience packed with tools and benefits,
                dedicated to businesses
              </p>
              <div className="title">
                <img src='./img/check.png' alt=''/>
                  Support student as a freelancer to help them grow!
              </div>

              <div className="title">
                <img src='./img/check.png' alt=''/>
                Get services with reasonable price and quality work
              </div>

              <div className="title">
                <img src='./img/check.png' alt=''/>
                boost your career as a freelancer by getting more projects
              </div>
              <button>Explore FlexiLearn</button>
            </div>
            picture next to the list
            <div className="item">
                <img src='https://fiverr-res.cloudinary.com/q_auto,f_auto,w_585,dpr_2.0/v1/attachments/generic_asset/asset/51c35c7cecf75e6a5a0110d27909a2f5-1690202609364/EN.png' alt='' />
            </div>
             
          </div>
        </div>

        <Slide slidesToShow={3} arrowsScroll={3}>
          {
            projects.map(card=>(
              < ProjectCard key={card.id} item={card}/>
            ))
          }
        </Slide>

    </div>
  )
}

export default Home
