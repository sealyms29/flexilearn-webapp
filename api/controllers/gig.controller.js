import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";

export const seedGigs = async (req, res, next) => {
  try {
    // Delete existing gigs first
    await Gig.deleteMany({});

    const dummyGigs = [
      {
        userId: "69565fea284f0333c632736e",
        title: "I will create a professional logo design",
        desc: "I will design a professional, creative and unique logo for your business",
        cat: "logo",
        price: 100,
        cover: "https://images.pexels.com/photos/3586280/pexels-photo-3586280.jpeg",
        images: ["https://images.pexels.com/photos/3586280/pexels-photo-3586280.jpeg"],
        shortTitle: "Logo Design",
        shortDesc: "I will design a professional logo",
        deliveryTime: 3,
        revisionNumber: 2,
        features: ["Unique Design", "Professional", "Custom"],
        sales: 5,
        totalStars: 50,
        starNumber: 10
      },
      {
        userId: "69565fea284f0333c632736e",
        title: "Modern & Creative Logo Design",
        desc: "Get a custom, memorable logo that represents your brand perfectly",
        cat: "logo",
        price: 150,
        cover: "https://images.pexels.com/photos/7974/pexels-photo.jpg",
        images: ["https://images.pexels.com/photos/7974/pexels-photo.jpg"],
        shortTitle: "Creative Logo",
        shortDesc: "Modern creative logo design",
        deliveryTime: 5,
        revisionNumber: 3,
        features: ["Branding", "Modern", "Unlimited Revisions"],
        sales: 12,
        totalStars: 60,
        starNumber: 12
      },
      {
        userId: "69565fea284f0333c632736e",
        title: "Minimalist Logo Design",
        desc: "Clean and minimal logo design that stands out",
        cat: "logo",
        price: 80,
        cover: "https://images.pexels.com/photos/1618519/pexels-photo-1618519.jpeg",
        images: ["https://images.pexels.com/photos/1618519/pexels-photo-1618519.jpeg"],
        shortTitle: "Minimalist Design",
        shortDesc: "Clean minimalist logo",
        deliveryTime: 2,
        revisionNumber: 2,
        features: ["Simple", "Modern", "Fast Delivery"],
        sales: 8,
        totalStars: 40,
        starNumber: 8
      },
      {
        userId: "69565fea284f0333c632736e",
        title: "Brand Identity Design Package",
        desc: "Complete branding package including logo, business card and more",
        cat: "logo",
        price: 300,
        cover: "https://images.pexels.com/photos/3887733/pexels-photo-3887733.jpeg",
        images: ["https://images.pexels.com/photos/3887733/pexels-photo-3887733.jpeg"],
        shortTitle: "Brand Package",
        shortDesc: "Full branding package",
        deliveryTime: 7,
        revisionNumber: 5,
        features: ["Logo", "Business Card", "Guidelines", "Complete Package"],
        sales: 15,
        totalStars: 75,
        starNumber: 15
      },
      {
        userId: "69565fea284f0333c632736e",
        title: "AI Art Generation Service",
        desc: "Create stunning AI-generated artwork from your descriptions",
        cat: "ai",
        price: 50,
        cover: "https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg",
        images: ["https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg"],
        shortTitle: "AI Art Generator",
        shortDesc: "AI-powered artwork creation",
        deliveryTime: 1,
        revisionNumber: 2,
        features: ["Fast", "Creative", "AI Powered"],
        sales: 20,
        totalStars: 100,
        starNumber: 20
      },
      {
        userId: "69565fea284f0333c632736e",
        title: "Professional AI Image Enhancement",
        desc: "Enhance and improve your images using AI technology",
        cat: "ai",
        price: 75,
        cover: "https://images.pexels.com/photos/6039245/pexels-photo-6039245.jpeg",
        images: ["https://images.pexels.com/photos/6039245/pexels-photo-6039245.jpeg"],
        shortTitle: "Image Enhancement",
        shortDesc: "AI image enhancement service",
        deliveryTime: 2,
        revisionNumber: 3,
        features: ["Quality", "Professional", "Multiple Formats"],
        sales: 10,
        totalStars: 45,
        starNumber: 9
      }
    ];

    const savedGigs = await Gig.insertMany(dummyGigs);
    res.status(201).json({ message: "Dummy gigs created successfully", count: savedGigs.length });
  } catch (err) {
    next(err);
  }
};

export const createGig = async (req, res, next) => {
  // Allow all authenticated users to create gigs (not just sellers)
  // Users can become sellers by creating gigs
  
  const newGig = new Gig({
    userId: req.userId,
    ...req.body,
  });

  try {
    const savedGig = await newGig.save();
    
    // Mark user as seller after creating first gig
    const User = require("../models/user.model.js").default;
    await User.findByIdAndUpdate(req.userId, { isSeller: true });
    
    res.status(201).json(savedGig);
  } catch (err) {
    next(err);
  }
};

// Admin create gig (bypass seller check)
export const createGigAdmin = async (req, res, next) => {
  const newGig = new Gig({
    userId: req.userId,
    ...req.body,
  });

  try {
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    next(err);
  }
};
export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (gig.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};
export const updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return next(createError(404, "Gig not found"));
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json(updatedGig);
  } catch (err) {
    next(err);
  }
};
export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return next(createError(404, "Gig not found!"));
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
};
export const getGigs = async (req, res, next) => {
  const q = req.query;
  const filters = {
    ...(q.userId && { userId: q.userId }),
    ...(q.cat && { cat: q.cat }),
    ...((q.min || q.max) && {
      price: {
        ...(q.min && { $gt: q.min }),
        ...(q.max && { $lt: q.max }),
      },
    }),
    ...(q.search && { title: { $regex: q.search, $options: "i" } }),
  };
  try {
    const gigs = await Gig.find(filters).sort({ [q.sort]: -1 });
    res.status(200).send(gigs);
  } catch (err) {
    next(err);
  }
};