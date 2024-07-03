const express = require('express');
const BlueprintsController = require('./controllers/blueprints');
const ToolsNodes = require('./controllers/toolsnodes');
const Tools = require('./controllers/tools');
const Arrows = require('./controllers/arrows');
const Upload = require('./controllers/uploads');
const Users = require('./controllers/users');
const passport = require('passport');
const servicePassport = require('../services/passport');
const router = express.Router();

const blueprints = new BlueprintsController();
const toolsNodes = new ToolsNodes();
const tools = new Tools();
const arrows = new Arrows();
const upload = new Upload();
const users = new Users();
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
});

router.get("/blueprints/tools", blueprints.getDomainTools.bind(blueprints));
router.post("/blueprints/tools", passport.authenticate('jwt', { session: false }), blueprints.getDomainTools.bind(blueprints));
router.post("/blueprints/", blueprints.updateBlueprint);
router.put("/blueprints/:id", blueprints.updateBlueprint);
router.get("/blueprints/tools/:id", passport.authenticate('jwt', { session: false }), blueprints.getBluePrint.bind(blueprints));
router.delete('/blueprints/:id', blueprints.removeBluePrint.bind(blueprints));
router.get('/blueprints/list', passport.authenticate('jwt', { session: false }), blueprints.getBluePrintsForUser.bind(blueprints));
router.post('/blueprints/invite', passport.authenticate('jwt', { session: false }), blueprints.inviteUsers.bind(blueprints));
router.get('/blueprints/shared', passport.authenticate('jwt', { session: false }), blueprints.getSharedBluePrints.bind(blueprints));
router.put('/blueprints/:id/signin', passport.authenticate('jwt', { session: false }), blueprints.signUserToBluePrint.bind(blueprints));
router.get('/blueprints/:id/invited', passport.authenticate('jwt', { session: false }), blueprints.getInvitededUsers.bind(blueprints));

router.put("/toolsnodes/:id", servicePassport.optionalAthentication , toolsNodes.update.bind(toolsNodes));
router.post("/toolsnodes/", toolsNodes.add.bind(toolsNodes));
router.post("/toolsnodes/domain", toolsNodes.addDomainTool.bind(toolsNodes));
router.post("/toolsnodes/list", toolsNodes.addList.bind(toolsNodes));
router.post("/toolshide/", toolsNodes.hidelist.bind(toolsNodes));
router.post("/toolsunhide/", toolsNodes.unhideList.bind(toolsNodes));
router.get('/tools/search', toolsNodes.getListOfTools.bind(toolsNodes));
router.post('/toolsnodes/custom', toolsNodes.createCustom.bind(toolsNodes));
router.put('/toolsnodes/custom/:id', toolsNodes.updateCustom.bind(toolsNodes));
router.get('/tools/categories', toolsNodes.getListOfCategories.bind(toolsNodes));
router.post('/tools/updateVisibility/:id', passport.authenticate('jwt', { session: false }), tools.updateVisibility.bind(tools));


router.post("/arrows/", arrows.add.bind(arrows));
router.get("/arrows/", arrows.list.bind(arrows));
router.put("/arrows/:id", arrows.update.bind(arrows));
router.post("/arrows/remove", arrows.remove.bind(arrows));

router.post('/uploads/:id', upload.uploadImage.bind(upload));

router.post('/users/signup', users.signup.bind(users));
router.post('/users/signin', users.signin.bind(users));
router.get('/users/bycode', users.getUserByCode.bind(users));
router.post('/users/complete/:id', users.completeRegistration.bind(users));
router.get('/users', passport.authenticate('jwt', { session: false }), users.getList.bind(users));
router.put('/users/:id', passport.authenticate('jwt', { session: false }), users.update.bind(users));
router.delete('/users/:id', passport.authenticate('jwt', { session: false }), users.delete.bind(users));
router.post('/users/:id/reinvite', passport.authenticate('jwt', { session: false }), users.resendInvite.bind(users));
router.get('/users/:id/blueprints', passport.authenticate('jwt', { session: false }), users.getUserByBluePrint.bind(users));
router.post('/users/forgotpassword',  users.sendResetPass.bind(users));
router.post('/users/resetpassowrd', users.resetPassword.bind(users));

module.exports = router;