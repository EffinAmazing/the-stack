const axios = require('axios');
const fs = require('fs');
const path = require('path');

exports.downloadImage = async function (pathFile, url) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

    response.data.pipe(fs.createWriteStream(pathFile));

    let promise = new Promise((resolve, reject) => {
        response.data.on('end', () => {  resolve(pathFile) });

        response.data.on('error', (err) => reject(err));
    })

    return promise;
}

exports.uploadImage = function(imageStream, pathFile) {
    const _path = path.resolve(__dirname, '../public', pathFile );
    console.log('_path', _path);
    imageStream.pipe(fs.createWriteStream(_path));

    let promise = new Promise((resolve, reject) => {
        imageStream.on('end', () => { resolve(pathFile) });
        imageStream.on('error', (err) => reject(err));
    })

    return promise;
}