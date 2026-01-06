import React from "react";
import "./Gig.scss";
import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";
import getCurrentUser from "../../utils/getCurrentUser";

const Gig = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading, error, data } = useQuery({
    queryKey: ["gig"],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => {
        return res.data;
      }),
  });


  const userId = data?.userId ?? '';

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });

  // Handle checkout - redirect to registration if not logged in
  const handleCheckout = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Please register or login to continue with checkout");
      navigate("/register");
    } else {
      navigate(`/pay/${id}`);
    }
  };

  // Handle contact seller - create conversation and navigate to message
  const handleContactSeller = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Please register or login to contact the seller");
      navigate("/register");
      return;
    }

    // Prevent contacting yourself
    if (currentUser._id === data.userId) {
      alert("You cannot message yourself!");
      return;
    }

    try {
      // Create conversation with the seller
      const response = await newRequest.post("/conversations", {
        to: data.userId, // Send to seller
      });

      // Use the conversation ID from the response
      if (response.data && response.data.id) {
        navigate(`/message/${response.data.id}`);
      } else {
        alert("Failed to get conversation ID. Please try again.");
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
      if (err.response?.status === 409) {
        // Conversation might already exist, try to navigate using constructed ID
        const conversationId = currentUser._id < data.userId 
          ? currentUser._id + data.userId 
          : data.userId + currentUser._id;
        navigate(`/message/${conversationId}`);
      } else {
        alert("Failed to start conversation. Please try again.");
      }
    }
  };

  if (isLoading || isLoadingUser) {
    // Render a loading state
    return "Loading...";
  }

  if (error || errorUser || !data || !dataUser) {
    // Handle the error state with more detail
    const errorMessage = error?.message || errorUser?.message || "Gig not found";
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Something went wrong!</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }


  return (
    <div className='gig'>
      {isLoading ? "loading" : error ? "Something went wrong" :
      <div className="container">
        <div className="left">
          <span className="breadCrumbs">FlexiLearn ➤  Graphics & Design ➤ Gig ➤ </span>
          <h1>{data.title}</h1>
            {isLoadingUser ? ("loading") : errorUser ? ("Something went wrong!") : (
              <div className="user">
                <img
                  className="pp"
                  src={dataUser.img || "/img/pp1.jpg"}
                  alt=""
                />
                <span>{dataUser.username}</span>

                {data.starNumber > 0 && data.totalStars >= 0 && (
                  <div className="stars">
                    { Array(Math.max(0, Math.round(data.totalStars / data.starNumber)))
                      .fill()
                      .map((item, i) => (
                        <img src="/img/star.png" alt="" key={i} />
                      ))}
                    <span>{Math.round(data.totalStars / data.starNumber)}</span>
                  </div>
                )}
              </div>
            )}

            <Slider slidesToShow={1} arrowsScroll={1} className="slider">
               {
                (data.images && Array.isArray(data.images) && data.images.length > 0) 
                  ? data.images.map((img)=>(
                      <img key={img} src={img} alt="" />
                    ))
                  : <img src={data.cover || "/img/placeholder.png"} alt="Gig cover" />
               }
          </Slider>
          <h2>About This Gig</h2>
          <p>{data.desc}</p>
          {isLoadingUser ? ("loading"):errorUser ? ("something went wrong !")
          :(
          <div className="seller">
            <h1>About The Seller</h1>
            <div className="user">
            <img src={dataUser.img || "/img/girl.png"} alt="" />
                <div className="info">
                  <span>{dataUser.username}</span>
                      {data.starNumber > 0 && data.totalStars >= 0 && (
                        <div className="star">
                          {Array(Math.max(0, Math.round(data.totalStars / data.starNumber)))
                            .fill()
                            .map((item, i) => (
                              <img src="/img/star.png" alt="" key={i} />
                            ))}
                          <span>
                            {Math.round(data.totalStars / data.starNumber)}
                          </span>
                        </div>
                      )}
                    <button onClick={handleContactSeller}>Contact Me</button>
                </div>
            </div>
            <div className="box">
              <div className="items">
                  <div className="item">
                    <span className="title">From</span>
                    <span className="desc">{dataUser.country}</span>
                  </div>
                  <div className="item">
                    <span className="title">Member since</span>
                    <span className="desc">Aug 2022</span>
                  </div>
                  <div className="item">
                    <span className="title">Avg. response time</span>
                    <span className="desc">4 hours</span>
                  </div>
                  <div className="item">
                    <span className="title">Last delivery</span>
                    <span className="desc">1 day</span>
                  </div>
                  <div className="item">
                    <span className="title">Languages</span>
                    <span className="desc">English</span>
                  </div>
                </div>
                <hr/>
                <p>{dataUser.desc}</p>
            </div>
          </div>
         )} 
         <Reviews gigId={id}/>
        </div>
        <div className="right">
          <div className="price">
            <h3>{data.shortTitle}</h3>
            <h2>$ {data.price}</h2>
          </div>
          <p>
            {data.shortDesc}
          </p>
          <div className="details">
            <div className="item">
              <img src='/img/clock.png' alt=''/>
              <span>{data.deliveryTime} Days Delivery</span>
            </div>
            <div className="item">
              <img src='/img/recycle.png' alt=''/>
              <span>{data.revisionNumber} Revisions</span>
            </div>
          </div>
           <div className="features">
              {data.features.map((feature) => (
                <div className="item" key={feature}>
                  <img src="/img/greencheck.png" alt="" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <button onClick={handleCheckout}>Continue</button>
          
        </div>
      </div>}
    </div>
  )
}

export default Gig
