const express = require('express');
const BlueprintsController = require('./controllers/blueprints');
const ToolsNodes = require('./controllers/toolsnodes');
const Arrows = require('./controllers/arrows');
const router = express.Router();

const blueprints = new BlueprintsController();
const toolsNodes = new ToolsNodes();
const arrows = new Arrows();
// console.log(blueprints);
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
router.get("/blueprints/tools", blueprints.getDomainTools.bind(blueprints));
router.post("/blueprints/", blueprints.updateBlueprint);
router.put("/plueprints/:id", blueprints.updateBlueprint);

router.put("/toolsnodes/:id", toolsNodes.update.bind(toolsNodes));
router.post("/toolshide/", toolsNodes.hidelist.bind(toolsNodes));

router.post("/arrows/", arrows.add.bind(arrows));
router.get("/arrows/", arrows.list.bind(arrows));
router.put("/arrows/:id", arrows.update.bind(arrows));
router.post("/arrows/remove", arrows.remove.bind(arrows));

module.exports = router;