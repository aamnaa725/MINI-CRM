require('dotenv').config();
const emailjs = require("@emailjs/nodejs");

async function test() {
  try {
    console.log("Sending email...");
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      {
        to_email: "zarasaa31@gmail.com",
        email: "zarasaa31@gmail.com",
        name: "Test User",
        otp: "123456",
        message: "Test message"
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY
      }
    );
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
