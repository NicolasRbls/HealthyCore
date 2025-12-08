const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 */
exports.sendPasswordResetEmail = async (email, token) => {
    // Contournement Gmail: Lien HTTP vers backend qui redirige vers le deep link
    // Utilise API_URL défini dans .env (ex: http://localhost:5000/api)
    const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
    const resetLink = `${apiUrl}/auth/reset-password-redirect?token=${token}`;

    // If no SMTP credentials, log to console for development
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('========================================================');
        console.log('📧 [MOCK EMAIL SERVICE]');
        console.log(`To: ${email}`);
        console.log(`Subject: Réinitialisation de mot de passe`);
        console.log(`Link: ${resetLink}`);
        console.log('========================================================');
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"HealthyCore" <noreply@healthycore.com>',
        to: email,
        subject: 'Réinitialisation de votre mot de passe HealthyCore',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="color: #666; font-size: 12px;">Ce lien est valide pendant 15 minutes.</p>
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Erreur lors de l\'envoi de l\'email');
    }
};
