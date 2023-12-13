const axios = require("axios");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const checkIPInterval = 600000; // 10 minutes
// const checkIPInterval = 3000; // 3 seconds
let previousIP = "";
let firstRun = true;

// const mailTransporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.e,
//     pass: process.env.p,
//   },
// });
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.School,
    pass: process.env.appPass,
  },
});

const sendEmail = async function sendEmail(newIP) {
  const mailOptions = {
    from: process.env.School, // sender address
    to: process.env.e,
    subject: "Your Public IP Address has changed",
    text: `Your new IP address is: ${newIP}`,
  };

  try {
    await mailTransporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function getPublicIP() {
  try {
    const response = await axios.get("https://api64.ipify.org?format=json");
    const { ip } = response.data;
    return ip;
  } catch (error) {
    console.error("Error getting IP address:", error);
  }
}

async function checkIPChange() {
  const currentIP = await getPublicIP();

  if (currentIP !== previousIP) {
    console.log("IP address has changed. Sending email...");
    sendEmail(currentIP);
    previousIP = currentIP;
  } else {
    console.log("IP address has not changed.");
  }
  console.log("Current IP address:", currentIP);
}

if (firstRun) {
  getPublicIP()
    .then((ip) => {
      previousIP = ip;
      console.log("Previous IP address:", previousIP);
      sendEmail(previousIP);
    })
    .catch((error) => console.log(error));

  firstRun = false;
}

setInterval(checkIPChange, checkIPInterval);
