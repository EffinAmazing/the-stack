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

module.exports.sendResetPassword = async function(email, user, frontPath, code){
    const link = frontPath + '#/profile/reset-password/' + code;

    let textMail = 'Someone has requested a password reset for the following account: \n Email: </b> ' + user.email + ' \n First Name: ' + user.firstName + '\n Last Name: ' + ' \n To reset your password, visit the following address: <' + link + '>';
    let textHTML = '<p>Someone has requested a password reset for the following account:</p><p> <b> Email: </b> ' + user.email + ' </p><p> <b> First Name: </b> ' + user.firstName + ' </p><p> <b> Last Name: </b> ' + user.lastName + '  </p><p>To reset your password, visit the following address: <a href="' + link + '">' + link + '</a> </p>';

    const msg = {
        to: email,
        from: 'no-reply@mcgaw.io',
        subject: 'Reset password!',
        text: textMail,
        html: textHTML
    }

    console.log(msg);

    await sgMail.send(msg);
}
