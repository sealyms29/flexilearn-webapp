import React, { useReducer, useState, useEffect } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../../utils/getCurrentUser";

const Add = () => {
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);

  // Set userId dynamically from current authenticated user
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      dispatch({
        type: "CHANGE_INPUT",
        payload: { name: "userId", value: currentUser._id },
      });
    }
  }, []);

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };
  const handleFeature = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      let cover = "";
      let images = [];
      
      if (singleFile) {
        cover = await upload(singleFile);
      }
      
      if (files.length > 0) {
        images = await Promise.all(
          [...files].map(async (file) => {
            const url = await upload(file);
            return url;
          })
        );
      }
      
      setUploading(false);
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
      alert("Images uploaded successfully!");
    } catch (err) {
      setUploading(false);
      console.log(err);
      alert("Image upload failed, but you can still create gig without images");
      // Allow creation without images
      dispatch({ type: "ADD_IMAGES", payload: { cover: "", images: [] } });
    }
  };

  console.log(state)

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const createGig = async () => {
    try {
      const response = await newRequest.post("/gigs", state);
      return response.data; // Assuming your server responds with the created gig data
    } catch (error) {
      throw error; // Rethrow the error to let React Query handle it
    }
  };

  const mutation = useMutation(createGig, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["myGigs"]);
      navigate("/mygigs");
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!state.title || !state.cat || !state.desc || !state.shortTitle || !state.shortDesc) {
      alert("Please fill in all required fields");
      return;
    }
    
    mutation.mutate(); // Trigger the mutation
  };

  return (
    <div className="add">
      <div className="container">
        <h1>Add New Gig</h1>
        <div className="sections">
          <div className="info">
            <label htmlFor="">Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. I will do something I'm really good at"
              onChange={handleChange}
            />
            <label htmlFor="">Category</label>
            <select name="cat" id="cat" onChange={handleChange}>
              <option value="design">Design</option>
              <option value="web">Web Development</option>
              <option value="animation">Animation</option>
              <option value="music">Music</option>
            </select>
            <div className="images">
              <div className="imagesInputs">
                <label htmlFor="">Cover Image</label>
                <input
                  type="file"
                  onChange={(e) => setSingleFile(e.target.files[0])}
                />
                <label htmlFor="">Upload Images</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
              <button onClick={handleUpload}>
                {uploading ? "uploading" : "Upload"}
              </button>
            </div>
            <label htmlFor="">Description</label>
            <textarea
              name="desc"
              id=""
              placeholder="Brief descriptions to introduce your service to customers"
              cols="0"
              rows="16"
              onChange={handleChange}
            ></textarea>
            <button onClick={handleSubmit}>Create</button>
          </div>
          <div className="details">
            <label htmlFor="">Service Title</label>
            <input
              type="text"
              name="shortTitle"
              placeholder="e.g. One-page web design"
              onChange={handleChange}
            />
            <label htmlFor="">Short Description</label>
            <textarea
              name="shortDesc"
              onChange={handleChange}
              id=""
              placeholder="Short description of your service"
              cols="30"
              rows="10"
            ></textarea>
            <label htmlFor="">Delivery Time (e.g. 3 days)</label>
            <input type="number" name="deliveryTime" onChange={handleChange} />
            <label htmlFor="">Revision Number</label>
            <input
              type="number"
              name="revisionNumber"
              onChange={handleChange}
            />
            <label htmlFor="">Add Features</label>
            <form action="" className="add" onSubmit={handleFeature}>
              <input type="text" placeholder="e.g. page design" />
              <button type="submit">add</button>
            </form>
            <div className="addedFeatures">
              {state?.features?.map((f) => (
                <div className="item" key={f}>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_FEATURE", payload: f })
                    }
                  >
                    {f}
                    <span>X</span>
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="">Price</label>
            <input type="number" onChange={handleChange} name="price" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;