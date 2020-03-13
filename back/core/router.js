var express = require('express');
var BlueprintsController = require('./controllers/blueprints');
var router = express.Router();

var blueprints = new BlueprintsController();

router.all('*', function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");
	res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE, PATCH');
    next();
})

router.get("/", function(req, res, next){
    res.json({
        result: "ok"
    })
})
router.get("/blueprints/tools", blueprints.getDomainTools);
router.post("/blueprints/", blueprints.updateBlueprint);
router.put("/plueprints/:id", blueprints.updateBlueprint);

module.exports = router;