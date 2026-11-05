//This file contains nodemailer boilerplate code to send emails with a SMTP through email addresses(create a transporter, sending the email, etc...)
import dotenv from "dotenv"
dotenv.config()

import nodemailer from "nodemailer"
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

if (process.env.NODE_ENV !== "test") {
  transporter.verify((err, _success) => {
    if (err) {
      console.log("Error while connecting to the SMTP server! " + err)
    } else {
      console.log("SMTP server ready to send messages!")
    }
  })
}

//Function that sends the mail with the link to ensure that user's email can be validated
export default async function sendEmailNotification(
  to: string,
  subject: string,
  text: string
) {
  try {
    let message = await transporter.sendMail({
      from: `"${process.env.GMAIL_USER}"`,
      to,
      subject,
      text
    })
    console.log(`Message with the id: ${message.messageId} was sent`)
  } catch (err) {
    console.log(`Message could not be sent!`)
  }
}
