import React from 'react'
import { Link } from 'react-router-dom'
import "./CatCard.scss"  

const CatCard = ({item}) => {
  const getCategorySlug = (title) => {
    const slugMap = {
      "AI Artists": "ai",
      "Logo Design": "logo",
      "WordPress": "wordpress",
      "BlockChain": "blockchain",
      "Machine Learning": "ml",
      "System Design": "design",
      "Devops": "devops",
      "Illustration": "illustration",
      "Data Entry": "data"
    };
    return slugMap[title] || title.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <Link to={`/gigs?cat=${getCategorySlug(item.title)}`}>
      <div className='catCard'>
         <img src={item.img} alt='' />
         <span className='desc'>{item.desc}</span>
         <span className='title'>{item.title}</span>
      </div>
    </Link>

  )
}

export default CatCard