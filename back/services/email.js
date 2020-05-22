const sgMail = require('@sendgrid/mail');
const config = require('../config');


sgMail.setApiKey(config.SENDGRID_API_KEY);

module.exports.sendInviteForUser = async function (email, user, frontPath, blueprintId) {

    const linkBluePrint = frontPath + '#/stack/build/' + blueprintId;
    const link = frontPath + '#/profile/verify/' + user.validationCode;
    
    const textInviteMail = 'You have got invite to edit stack, \n please go via link to complete registration: <' + link + '>';
    const htmlInviteMail = '<p>You have got invite to edit stack,</p><p> please go via link to complete registration: <a href="' + link + '">' + link + '</a> </p>';

    const textConfirmationMail = 'You have been added to a new stack, \n you can view it by link: <' + linkBluePrint + '>';
    const htmlConfirmationMail = '<p> You have been added to a new stack, you can view it by link: <a href="' + linkBluePrint + '">' + linkBluePrint + '</a> </p>'

    let textMail = user.verified ? textConfirmationMail : textInviteMail;
    let htmlMail = user.verified ?  htmlConfirmationMail : htmlInviteMail;
    
    console.log('send to - ', email, user.verified);
    const msg = {
        to: email,
        from: 'no-reply@mcgaw.io',
        subject: 'Inivite to Marketing Technologies Stack Builder',
        text: textMail,
        html: htmlMail,
    };

    await sgMail.send(msg);
}
