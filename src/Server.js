//Run with node.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const moment = require('moment');
const connection = mysql.createConnection({
    host    : 'roomreserver.cmaqlsxikwgt.us-east-1.rds.amazonaws.com',
    user    : 'SeniorDesign845',
    password: 'spnproject2019',
    database: 'spn-scheduler'
});

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const dateFormat = require('dateformat');

connection.connect(function(err){
    if(err)
        console.log(err);
});

app.get('/', function(req, res) {
       connection.query('call calendarDisplay(1,1)', function(err, data) {
           (err)? res.send(err) : res.json({schedule :data});
       });
});

app.get('/calendar', function (req, res) {

    connection.query('call calendarDisplay(1,1)', function(error, results, fields){
        if(error) throw error;
        console.log('Connected');
        res.send(results[0])
    });
});

app.post('/hours', function(req, res) {
    console.log('Format: ' +dateFormat(req.body.startDate, "yyyy-mm-dd hh:MM:ss"));
    connection.query(`call availableHours( ${req.body.username}, '${req.body.room}',${req.body.building}, '${dateFormat(req.body.startDate, "yyyy-mm-dd hh:MM:ss")}' )`, function(error, results, fields){
       if(error) throw error;
       console.log(results[0][0]);
       res.send(results[0][0]);
    });
});

app.post('/semester', function(req, res) {
    connection.query(`call getSemester(${req.body.building})`, function(error, results, fields){
        if(error) throw error;
        console.log(results[0][0]);
        res.send(results[0][0]);
    });
});

app.post('/verifyReservations', async function(req, res) {
    let startdate, starttime, endtime;

    const promises = req.body.reservations.map(async r =>{
        startdate = moment(r).format('YYYY-MM-DD');
        starttime = moment(req.body.startTime).format('HH:mm:ss');
        endtime = moment(req.body.endTime).format('HH:mm:ss');

       return new Promise(function(resolve,reject) {
           connection.query(`call verifyReservation(${req.body.username},${req.body.building},'${startdate + ' ' + starttime}', '${startdate + ' ' + endtime}', ${req.body.roomID})`, function (error, results, fields) {
               if (error) throw error;

               //Since this is asynchronous to the map assignment, reassign to get correct values
               startdate = moment(r).format('YYYY-MM-DD');
               starttime = moment(req.body.startTime).format('HH:mm:ss');
               endtime = moment(req.body.endTime).format('HH:mm:ss');
               console.log("THIS: " + startdate);

               resolve ({
                   id: req.body.roomID,
                   title: 'NEW RESERVATION',
                   start: startdate + ' ' + starttime,
                   end: startdate + ' ' + endtime,
                   valid: results[0][0]
               });
           });
       })

   });
    let hold = await(Promise.all(promises));
    console.log(hold);
    //console.log(await Promise.all(promises));
    //console.log(accepted);
    res.send(hold);
});

app.listen(5000, () => {
    console.log('Running on port 5000');
});