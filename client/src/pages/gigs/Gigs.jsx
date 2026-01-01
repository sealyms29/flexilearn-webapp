import React,{ useEffect, useRef, useState } from "react";
import "./Gigs.scss";
import GigCard from "../../components/gigCard/GigCard";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";

const Gigs = () => {

  const[sort, setSort] = useState("sales");
  const[open, setOpen] = useState(false);
  const minRef = useRef();
  const maxRef = useRef(); 
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(999999);
  
  const { search } = useLocation();
  
  const searchParams = new URLSearchParams(search);
  const category = searchParams.get('cat') || 'all';
  
  const getCategoryName = (cat) => {
    const nameMap = {
      "ai": "AI Artists",
      "logo": "Logo Design",
      "wordpress": "WordPress",
      "blockchain": "BlockChain",
      "ml": "Machine Learning",
      "design": "System Design",
      "devops": "DevOps",
      "illustration": "Illustration",
      "data": "Data Entry",
      "all": "All Services"
    };
    return nameMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };
  
  const categoryName = getCategoryName(category);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["gigs", category, minVal, maxVal, sort], 
    queryFn: () => {
      const min = minRef.current?.value || minVal || 0;
      const max = maxRef.current?.value || maxVal || 999999;
      const queryStr = category && category !== 'all' 
        ? `?cat=${category}&min=${min}&max=${max}&sort=${sort}`
        : `?min=${min}&max=${max}&sort=${sort}`;
      
      return newRequest
        .get(`/gigs${queryStr}`)
        .then((res) => {
          return res.data;
        })
        .catch((error) => {
          console.error('Error fetching gigs:', error);
          throw error;
        });
    },
  });


  const reSort = (type) => {
    setSort(type);
    setOpen(false);
  };

  useEffect(() => {
    refetch();
  }, [sort, category, refetch]);

  const apply = () => {
    setMinVal(minRef.current?.value || 0);
    setMaxVal(maxRef.current?.value || 999999);
    refetch();
  };

  return (
    <div className='gigs'>
      <div className="container">
        <span className='breadcrumbs'>FlexiLearn ➤ Services ➤ {categoryName}</span>
        <h1>{categoryName}</h1>
        <p>Explore {categoryName} services available on FlexiLearn</p>

        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={apply}>Apply</button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img src="./img/down.png" alt="" onClick={() => setOpen(!open)} />
            {open && (
              <div className="rightMenu">
                {sort === "sales" ? (
                  <span onClick={() => reSort("createdAt")}>Newest</span>
                ) : (
                  <span onClick={() => reSort("sales")}>Best Selling</span>
                )}
                <span onClick={() => reSort("sales")}>Popular</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="cards">
            {isLoading ? "loading": error
            ? "Something went wrong! " + JSON.stringify(error)
            : data && data.length > 0 ? data.map((gig) => <GigCard key={gig._id} item={gig} />) : "No gigs found"}
        </div>

      </div>
    </div>
  )
}

export default Gigs
