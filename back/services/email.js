const sgMail = require('@sendgrid/mail');
const config = require('../config');


sgMail.setApiKey(config.SENDGRID_API_KEY);

module.exports.sendInviteForUser = async function (email, user, frontPath) {
    
    const link = frontPath + '#/profile/verify/' + user.validationCode;
    const msg = {
        to: email,
        from: 'no-reply@mcgaw.io',
        subject: 'Inivite to Marketing Technologies Stack Builder',
        text: 'You have got invite to edit stack, \n please go via link: <' + link + '>',
        html: '<p>You have got invite to edit stack,</p><p> please go via link: <a href="' + link + '">' + link + '</a> </p>',
    };

    await sgMail.send(msg);
}
