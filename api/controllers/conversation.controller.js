import createError from "../utils/createError.js";
import Conversation from "../models/conversation.model.js";

export const createConversation = async (req, res, next) => {
  // Determine seller and buyer roles
  const sellerId = req.isSeller ? req.userId : req.body.to;
  const buyerId = req.isSeller ? req.body.to : req.userId;
  
  // Create a normalized conversation ID that's the same regardless of who initiates
  // Always use: [smaller_id][larger_id] to ensure consistency
  const id1 = sellerId;
  const id2 = buyerId;
  const normalizedId = id1 < id2 ? id1 + id2 : id2 + id1;

  console.log(`Creating conversation - Buyer: ${buyerId}, Seller: ${sellerId}, ID: ${normalizedId}`);

  try {
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({ id: normalizedId });
    if (existingConversation) {
      console.log(`Conversation already exists: ${normalizedId}`);
      // Update the read status for the current user
      const updated = await Conversation.findOneAndUpdate(
        { id: normalizedId },
        {
          $set: {
            ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }),
          },
        },
        { new: true }
      );
      return res.status(200).send(updated);
    }

    const newConversation = new Conversation({
      id: normalizedId,
      sellerId: sellerId,
      buyerId: buyerId,
      readBySeller: req.isSeller,
      readByBuyer: !req.isSeller,
    });

    console.log(`Saving new conversation: ${normalizedId}`);
    const savedConversation = await newConversation.save();
    res.status(201).send(savedConversation);
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          // readBySeller: true,
          // readByBuyer: true,
          ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }),
        },
      },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Not found!"));
    res.status(200).send(conversation);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    // Get all conversations where the user is either buyer or seller
    const conversations = await Conversation.find({
      $or: [
        { buyerId: req.userId },
        { sellerId: req.userId }
      ]
    }).sort({ updatedAt: -1 });
    
    console.log(`Getting conversations for user ${req.userId} - Found ${conversations.length} conversations`);
    conversations.forEach(c => {
      console.log(`  - Conversation ${c.id}: Buyer ${c.buyerId}, Seller ${c.sellerId}`);
    });
    
    res.status(200).send(conversations);
  } catch (err) {
    next(err);
  }
};