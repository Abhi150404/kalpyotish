const Contact = require("../models/Contact");
const twilio = require("twilio");
require("dotenv").config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.addContact = async (req, res) => {
  try {
    const { name, email, mobile, gender, dob_time, place_of_birth, query } = req.body;

    // Validate inputs
    if (!name || !email || !mobile || !gender || !dob_time || !place_of_birth || !query) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Save in DB
    const contact = await Contact.create({
      name,
      email,
      mobile,
      gender,
      dob_time,
      place_of_birth,
      query,
    });

    // Prepare WhatsApp message
    const messageBody = `
📩 *New Contact Form Submission*
━━━━━━━━━━━━━━━
👤 Name: ${name}
📧 Email: ${email}
📱 Mobile: ${mobile}
⚧ Gender: ${gender}
🎂 DOB + Time: ${dob_time}
📍 Place of Birth: ${place_of_birth}
🗒️ Query: ${query}
━━━━━━━━━━━━━━━
✅ Please follow up with this user.
`;

    // Send WhatsApp message to admin
    const messageResponse = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.ADMIN_WHATSAPP_NUMBER,
      body: messageBody,
    });

   
    console.log("✅ WhatsApp message sent! SID:", messageResponse.sid);

    res.status(201).json({
      success: true,
      message: "Form submitted successfully and WhatsApp message sent!",
      data: contact,
    });
  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
