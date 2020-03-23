const fs = require('fs');
const path = require('path');

class Upload {
    uploadImage(req, res, next) {
        
        const id = req.params.id;
        const image = req.body.image;
        console.log(image, id);
        if(image && id) {
            const _path = path.resolve(__dirname, '../../public/uploads/', id + '.jpg');
            image.pipe(fs.createWriteStream(_path));

            image.on('end', () =>{
                res.json({
                    result: '/uploads/' + id + '.jpg'
                });
            });

            image.on('error', ()=>{
                res.status(500).json({
                    result: 'Error',
                    message: err.message
                });
            });

            /* */
        } else {
            res.status(400).json({
                result: 'Error',
                message: 'BadRequest'
            })
        }
    }
}

module.exports = Upload;