//Run with node.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host    : 'roomreserver.cmaqlsxikwgt.us-east-1.rds.amazonaws.com',
    user    : 'SeniorDesign845',
    password: 'spnproject2019',
    database: 'spn-scheduler'
});

const app = express();

connection.connect(function(err){
    if(err)
        console.log(err);
});

app.get('/', function(req, res) {
        //call dailyRoomReservations(1, '2019-01-22 00:00:00','2019-01-23 00:00:00)
       connection.query('call calendarDisplay(1,1)', function(err, data) {
           (err)? res.send(err) : res.json({schedule :data});
       });
});

app.get('/reservation', function (req, res) {

    connection.query('call calendarDisplay(1,1)', function(error, results, fields){
        if(error) throw error;
        console.log('Connected');
        res.send(results[0])
    });
});

app.listen(5000, () => {
    console.log('Running on port 5000');
});