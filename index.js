const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { job } = require("./cron.js");
const cors = require('cors');
dotenv.config();
const app = express();
app.use(express.json());
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
job.start();
// app.get("/contact", (req, res) => {
//     res.status(200).send("HII");
// })
app.use(cors({
    origin: ['http://127.0.0.1:5501', 'http://localhost:5501', 'https://ayushpathak12.github.io/'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.post("/contact", (req, res) => {
    const createTransporter = async () => {
        const oauth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );
        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });
        const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    console.log(err);
                }
                resolve(token);
            });
        });
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL,
                accessToken,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        return transporter;

    };
    const sendmail = async (mailOptions) => {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail(mailOptions);
        res.status(200).send("Email sent");
    }

    sendmail({
        subject: `Message from a website visitor - ${req.body.name}`,
        text: `${req.body.email}` + `\n` + `${req.body.phone}` + `\n` + `Query : ${req.body.query}` + `\n` + `Additional : ${req.body.additional}` + '\n' + `Gender : ${req.body.gender}`,
        from: req.body.email,
        to: process.env.EMAIL,
    })
})
app.listen(3000, () => {
    console.log("Server started running!");
})