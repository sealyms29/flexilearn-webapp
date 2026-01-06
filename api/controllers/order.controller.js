import createError from "../utils/createError.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";

// Configure email transporter (use your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

// Function to send order confirmation email
const sendOrderEmail = async (userEmail, userName, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@flexilearn.com",
      to: userEmail,
      subject: `Order Confirmation - FlexiLearn #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0;">Thank you for your purchase</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Your payment has been successfully processed. Here are your order details:</p>
            
            <div style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Order ID:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">#${order._id.toString().slice(-8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Service:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${order.title}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #4caf50; font-weight: bold;">$${order.price}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Order Date:</strong></td>
                  <td style="padding: 10px 0; text-align: right;">${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;"><strong>Next Steps:</strong> You can track your order progress by logging into your FlexiLearn account and visiting your orders page.</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">If you have any questions about your order, please contact us at support@flexilearn.com</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
              <p>© 2025 FlexiLearn. All rights reserved.</p>
              <p>This is an automated email, please do not reply directly.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw error - order is already created, email is just a bonus
  }
};

export const intent = async (req, res, next) => {
  try {
    console.log("=== Dummy Payment Intent Request ===");
    console.log("User ID:", req.userId);
    console.log("Gig ID:", req.params.id);
    console.log("Payment Method:", req.body.paymentMethod);
    
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      console.error("Gig not found with ID:", req.params.id);
      return next(createError(404, "Gig not found"));
    }

    console.log("Gig found:", { title: gig.title, price: gig.price, userId: gig.userId });

    const paymentMethod = req.body.paymentMethod || "card";

    // Generate a dummy payment intent ID
    const dummyPaymentIntentId = `pi_dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dummyClientSecret = `seti_dummy_${dummyPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 20)}`;

    // Determine currency based on payment method
    let currency = "usd";
    if (paymentMethod === "fpx") {
      currency = "myr";
    } else if (paymentMethod === "upi") {
      currency = "inr";
    }

    console.log(`Dummy payment intent created: ${dummyPaymentIntentId} for method: ${paymentMethod}`);

    // Create order with dummy payment intent
    const newOrder = new Order({
      gigId: gig._id,
      img: gig.cover,
      title: gig.title,
      buyerId: req.userId,
      sellerId: gig.userId,
      price: gig.price,
      payment_intent: dummyPaymentIntentId,
      paymentMethod: paymentMethod,
    });

    await newOrder.save();
    console.log("Order created:", newOrder._id);

    res.status(200).send({
      clientSecret: dummyClientSecret,
      paymentMethod: paymentMethod,
      currency: currency,
      isDummy: true, // Flag to indicate this is a dummy payment
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    console.error("Error message:", error.message);
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
    }).sort({ createdAt: -1 });

    console.log("Orders fetched:", orders.length);
    res.status(200).send(orders);
  } catch (err) {
    next(err);
  }
};

// Cleanup endpoint - removes all orders (for testing/development only)
export const cleanupOrders = async (req, res, next) => {
  try {
    const result = await Order.deleteMany({});
    console.log(`Deleted ${result.deletedCount} orders`);
    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} orders`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Error cleaning up orders:", err);
    next(err);
  }
};

export const confirm = async (req, res, next) => {
  try {
    console.log("Confirm order called with payment_intent:", req.body.payment_intent);
    
    const order = await Order.findOneAndUpdate(
      {
        payment_intent: req.body.payment_intent,
      },
      {
        $set: {
          isCompleted: true,
        },
      },
      { new: true }
    );

    console.log("Order found and updated:", order);

    if (order) {
      // Send confirmation email
      try {
        const buyer = await User.findById(order.buyerId);
        console.log("Buyer found:", buyer);
        
        if (buyer && buyer.email) {
          console.log("Sending email to:", buyer.email);
          await sendOrderEmail(buyer.email, buyer.username, order);
          console.log("Email sent successfully");
        } else {
          console.log("No buyer email found");
        }
      } catch (emailError) {
        console.error("Email sending failed but order confirmed:", emailError.message);
        // Don't fail the request just because email failed
      }
    } else {
      console.log("Order not found for payment_intent:", req.body.payment_intent);
    }

    res.status(200).json({
      message: "Order has been confirmed.",
      order: order,
    });
  } catch (err) {
    console.error("Error in confirm endpoint:", err);
    next(err);
  }
};
