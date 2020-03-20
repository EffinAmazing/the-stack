const ArrowModel = require('../../db/models/Arrows');

class Arrows {
    constructor(){
        this.model = new ArrowModel();
    }

    add(req, res, next) {
        let data = req.body.data;
        let blueprintId = req.body.blueprintId;
        if (data && blueprintId) {
            this.model.createArrowForBluePrint(blueprintId, data)
                .then((result)=>{
                    res.json({
                        result: result
                    })
                })
                .catch(err=>res.json({
                    result: "Error",
                    message: err.message
                }))
        } else {
            res.json({
                result: 'Error',
                message: 'incorrect data'
            });
        }
    }

    list(req, res, next) {
        const blueprintId = req.query.blueprint;
        if ( blueprintId ) {
            this.model.getArrowsByBluePrintId(blueprintId)
                .then((result)=>{
                    res.json({
                        result: result
                    })
                })
                .catch(err=>res.json({
                    result: "Error",
                    message: err.message
                }))
        } else {
            res.json({
                result: 'Error',
                message: 'needs blueprint Id '
            });
        }
    }

    update(req, res, next) {
        let data = req.body.data;
        let id = req.params.id;
        if( data && id ){
            this.model.updateOne(id, data).then((result)=>{
                res.json({
                    result: result
                })
            }).catch((err)=>{
                res.json({ 
                    result: "Error",
                    message: err.message
                })
            })
        } else {
            res.json({ 
                result: "Error",
                message: "incorrect data"
            })
        }
    }

    remove(req, res, next) {
        let lineIds = req.body.ids;
        if( lineIds ) {
            this.model.removeArrows(lineIds, [])
                .then((result)=>{
                    res.json({
                        result: result
                    })
                })
                .catch(err=>res.json({
                    result: "Error",
                    message: err.message
                }))
        } else {
            res.json({
                result: 'Error',
                message: 'needs Id '
            });
        }
    }
}

module.exports = Arrows;