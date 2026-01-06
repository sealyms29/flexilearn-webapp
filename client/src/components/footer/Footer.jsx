import React from 'react'
import "./Footer.scss"
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="container">
        <div className="bottom">
          <div className="left">
            <h2>FlexiLearn</h2>
            <span>Made with ❤️ technova © 2023 || FlexiLearn</span>
          </div>
          <div className="right">
            <div className="social">
                <img src="/img/instagram_1.png" alt="" />
                <img src="/img/facebook_1.png" alt="" />
                <img src="/img/linkedin_1.png" alt="" />
                <img src="/img/github_1.png" alt="" />
                <img src="/img/youtube_1.png" alt="" />
              </div>

              <div className="link">
                <img src='./img/language_4.png' alt=''/>
                <span>English</span>
              </div>

              <div className="link">
                <img src='./img/currency_1.png' alt=''/>
                <span>INR</span>
              </div>
              <img src='./img/accessability_2.png' alt='' />

          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
