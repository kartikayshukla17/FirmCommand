import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // MOCK EMAIL SENDING FOR DEV
    console.log('=================================================');
    console.log('📧 API: MOCK EMAIL SEND');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('--- Message ---');
    console.log(options.message);
    if (options.html) {
        console.log('--- HTML Content ---');
        console.log(options.html.substring(0, 100) + '...');
    }
    console.log('=================================================');
    return;

    /* 
    // Actual Nodemailer Implementation (Disabled)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Task Manager App'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html 
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId); 
    */
};

export default sendEmail;
