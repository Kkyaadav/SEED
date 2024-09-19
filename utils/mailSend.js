import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport(
    {
        secure:true,
        host:'smtp.gmail.com',
        port:465,
        auth:{
            user:'your email',  // your email
            pass:'your password'    // your password
        }
    }
);

export function registerMail(to, sub, name, link = '') {
    let msg = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f0f8ff; padding: 20px; border: 1px solid #d3d3d3; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0056b3; text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 10px;">Welcome to Samsung SEED</h1>
        <p style="font-size: 18px; color: #333;">Dear <span style="color: #0056b3;">${name}</span>,</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering with us. We are excited to have you on board!</p>`;

    if (link) {
        msg += `<p style="font-size: 16px; color: #333;">Click <a href="${link}" style="color: #0056b3;">here</a> to reset your password. The link will expire in 10 minutes.</p>`;
    }

    msg += `<p style="font-size: 16px; color: #333;">Best regards,</p>
            <p style="font-size: 18px; font-weight: bold; color: #333;">SAMSUNG SEED Team</p></div>`;

    transporter.sendMail({
        to: to,
        subject: sub,
        html: msg
    });
    console.log("Email sent");
}

export function forgotPasswordMail(to, name, link) {
    const subject = 'Password Reset Request';
    let msg = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f0f8ff; padding: 20px; border: 1px solid #d3d3d3; border-radius: 10px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0056b3; text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 10px;">Password Reset Request</h1>
        <p style="font-size: 18px; color: #333;">Dear <span style="color: #0056b3;">${name}</span>,</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Click <a href="${link}" style="color: #0056b3;">here</a> to create a new password. The link will expire in 10 minutes.</p>
        <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
        <p style="font-size: 16px; color: #333;">Best regards,</p>
        <p style="font-size: 18px; font-weight: bold; color: #333;">SAMSUNG SEED Team</p></div>`;

    transporter.sendMail({
        to: to,
        subject: subject,
        html: msg
    }, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}