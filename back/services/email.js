const sgMail = require('@sendgrid/mail');
const config = require('../config');
const staticMail = require('../db/static/mail');


sgMail.setApiKey(config.SENDGRID_API_KEY);

module.exports.sendInviteForUser = async function (email, user, frontPath, blueprint) {

    const linkBluePrint = frontPath + '#/stack/build/' + blueprint.id;
    const link = frontPath + '#/profile/verify/' + user.validationCode;
    
    const textInviteMail = 'Hi,\n You have been invited to edit a stack in the Marketing Technologies Stack Builder, \n please accept your invitation via this link to complete registration: <' + link + '> \n\n Thanks! \n McGaw.io Team';
    const htmlInviteMail = staticMail.mailStyle + staticMail.mailHeader(frontPath + '#/')  + 
        '<p> &nbsp; </p><div ' + staticMail.mailPStyles + '> Hi, </div><div ' + staticMail.mailPStyles + '>You have been invited to edit a stack in the Marketing Technologies Stack Builder,</div><div ' + staticMail.mailPStyles + '> please accept your invitation via this link to complete registration: </div> ' +
        '<p style="text-align: center;"> <img src="' + config.SERVER_URI + '/domain-logos/' + blueprint.domain + '.png" /> <br /> <b style="font-size: 18px;">' + blueprint.domain + '</b> </p>' +
        '<p style="text-align: center;"> <a  ' + staticMail.mailButtonStyles + ' href="' + link + '">  Visit the Stack  </a>  </p>' +
        staticMail.mailFooter;

    const textConfirmationMail = 'Hi ' + user.firstName + ' ' + user.lastName + ', \n You have been added to a new stack in the Marketing Technologies Stack Builder, \n you can view it via this link: <' + linkBluePrint + '> \n\n Thanks! \n McGaw.io Team';
    const htmlConfirmationMail = staticMail.mailStyle + staticMail.mailHeader(frontPath + '#/')  + 
    '<p> &nbsp; </p><div ' + staticMail.mailPStyles + '> Hi <b> ' + user.firstName + ' ' + user.lastName + ', </b> </div>' + 
    '<div ' + staticMail.mailPStyles + '> <p ' + staticMail.mailPStyles + '> You have been added to a new stack in the Marketing Technologies Stack Builder, you can view it via this link: </div> ' +
    '<p style="text-align: center;"> <img src="' + config.SERVER_URI + '/domain-logos/' + blueprint.domain + '.png" /> <br /> <b style="font-size: 18px;">' + blueprint.domain + '</b> </p>' +
    '<p style="text-align: center;"> <a ' + staticMail.mailButtonStyles + ' href="' + linkBluePrint + '"> Visit the Stack </a> </p><p> &nbsp; </p>'
    +  staticMail.mailFooter;

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

    let textMail = 'Hi, ' + user.firstName + ' ' + user.lastName + ' \n Someone has requested a password reset for the following account: \n Email: </b> ' + user.email + ' \n First Name: ' + user.firstName + '\n Last Name: ' + ' \n To reset your password, visit the following address: <' + link + '>';
    let textHTML = staticMail.mailHeader(frontPath + '#/') + '<p> &nbsp; </p><div ' + staticMail.mailPStyles + '> Hi, <b> ' + user.firstName + ' ' + user.lastName + ' </b> </div>' +  
    '<div ' + staticMail.mailPStyles + '>Someone has requested a password reset for the following account:</div><div ' + staticMail.mailPStyles + '> <b> Email: </b> ' + user.email + ' </div><div ' + staticMail.mailPStyles + '> <b> First Name: </b> ' + user.firstName + ' </div><div ' + staticMail.mailPStyles + '> <b> Last Name: </b> ' + user.lastName + '  </p><p>To reset your password, visit the following address: <a href="' + link + '">' + link + '</a> </div>' + staticMail.mailFooter;

    const msg = {
        to: email,
        from: 'no-reply@mcgaw.io',
        subject: 'Password reset for McGaw.io Marketing Stack Builder',
        text: textMail,
        html: textHTML
    }

    console.log(msg);

    await sgMail.send(msg);
}
