
module.exports.mailHeader = function(frontUrl) {
    return `<table style="border: 0; width: 100%;">
    <tbody class="mail-container">
        <tr>
            <td class="mail-header" align="center"
            style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';  box-sizing: border-box; padding: 25px 0; text-align: center; background-color: #24282d;"> <a href="${frontUrl}" style="color: #ffffff; font-size: 24px; font-weight: bold; text-decoration: none;">Marketing Tool Stack Builder</a> </td>
        </tr>
        <tr>
            <td class="content-cell" align="center" style="color: #3d4852; font-size: 16px; line-height: 1.5em;">
                <table style="max-width: 540px; width: 100%; margin: auto; border: 0;"><tbody><tr><td>`;
}

module.exports.mailFooter = `<div> Thanks! <br/> McGaw Team </div></td></tr></table>
            </td>
        </tr>
        <tr>
            <td class="content-cell" align="center" style="padding-top: 40px;"> 
              <p style="line-height: 1.5em; margin-top: 0; color: #aeaeae; font-size: 12px; text-align: center;">  © Copyright ${new Date().getFullYear()} McGaw, All Rights Reserved. </p>
            </td>
        </tr>
    </tbody>
</table>`;

module.exports.mailPStyles = 'style="style="color: #3d4852; font-size: 16px; line-height: 1.5em; text-align: left;"';

module.exports.mailButtonStyles = `style="box-sizing: border-box; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); color: #fff; display:  inline-block; text-decoration: none; -webkit-text-size-adjust: none; background-color: #ff4100; border-top: 10px solid #ff4100; border-right: 18px solid #ff4100; border-bottom: 10px solid #ff4100; border-left: 18px solid #ff4100;"`;

module.exports.mailStyle = `<style type="text/css">
    table {
        border: 0;
    }
    .mail-header {   
        
    }
</style>`;