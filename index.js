var moment = require('moment');
moment().format();
const express = require('express');
const exphbs = require('express-handlebars');
const handlebarSetup = exphbs({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});


const bodyParser = require('body-parser');
const SettingsBill = require('./settings-bill');

const app = express();
const settingsBill = SettingsBill();

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    var addClass = ""
  
    if (settingsBill.hasReachedWarningLevel()) {
        addClass = "warning"
    }
    if (settingsBill.hasReachedCriticalLevel()) {
        addClass = "danger"
    }
    res.render('index', {
        settings: settingsBill.getSettings(),
        totals: settingsBill.totals(),
        totalSettings: addClass
    });
});

app.post('/settings', function (req, res) {


    settingsBill.setSettings({
        callCost: req.body.callCost,
        smsCost: req.body.smsCost,
        warningLevel: req.body.warningLevel,
        criticalLevel: req.body.criticalLevel
    });
    res.redirect('/');
});
app.post('/action', function (req, res) {
    settingsBill.recordAction(req.body.actionType)
    res.redirect('/');
});

app.get('/actions', function (req, res) {
    var newAction = settingsBill.actions();
    newAction.forEach(element => {
        element.newTime = moment(element.timestamp).fromNow()
    });

    res.render('actions', { actions: newAction });

});
app.get('/actions/:actiontype', function (req, res) {
    const actionType = req.params.actiontype;
    res.render('actions', { actions: settingsBill.actionsFor(actionType) });

});

const PORT = process.env.PORT || 3011;

app.listen(PORT, function () {
    console.log("App started at port:", PORT);
});