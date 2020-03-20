const axios = require('axios');
const fs = require('fs');

exports.dwonloadImage = async function (path, url) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

    response.data.pipe(fs.createWriteStream(path));

    let promise = new Promise((resolve, reject) => {
        response.data.on('end', () => {  resolve() });

        response.data.on('error', (err) => reject(err));
    })

    return await promise;
}