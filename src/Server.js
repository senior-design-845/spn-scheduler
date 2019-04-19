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
        res.send(results[0]);
    });
});

app.post('/email', function (req,res){
    let emailMessage = `${req.body.room} was successfully reserved!\nEvent Title: ${req.body.title}\nEvent Description: ${req.body.description}\n\nTimes:\n`;
    req.body.reservations.map(r => {
        emailMessage += `Start: ${moment(r.start).format('YYYY-MM-DD HH:mm:ss')}\n`;
        emailMessage += `End: ${moment(r.end).format('YYYY-MM-DD HH:mm:ss')}\n\n`;
    });


    ///////////////////////////////////////////////////////////////////////
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');

    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'utdroomreservation@gmail.com',
                pass: 'goteam845'
            }
    }));

    // send mail with defined transport object
    const mailOptions = {
        from: 'utdroomreservation@gmail.com',
        to: 'jcc160330@utdallas.edu',
        subject: 'Sending Email using Node.js[nodemailer]',
        text: emailMessage
    };

    transporter.sendMail(mailOptions, function (err, info) {
        console.log("yo");
        if(err)
            console.log(err)
        else
            console.log(info);
    });

    res.send("Email sent");
    ////////////////////////////////////////////////////////////////

});



app.post('/userReservations', function (req, res) {
    let uid = req.body.uid;
    let bid = req.body.bid;
    let orderBy = req.body.orderBy;

    connection.query(`call userReservations(${uid},${bid},${orderBy})`, function(error, results, fields){
        if(error) throw error;
        console.log('Connected');
        res.send(results[0]);
    });
});

app.post('/userPastReservations', function (req, res) {
    let uid = req.body.uid;
    let bid = req.body.bid;
    let orderBy = req.body.orderBy;

    connection.query(`call userPastReservations(${uid},${bid},${orderBy})`, function(error, results, fields){
        if(error) throw error;
        console.log('Connected');
        res.send(results[0]);
    });
});

app.post('/userAllReservations', function (req, res) {
    let bid = req.body.bid;
    let orderBy = req.body.orderBy;

    connection.query(`call userAllReservations(${bid},${orderBy})`, function(error, results, fields){
        if(error) throw error;
        console.log('Connected');
        res.send(results[0]);
    });
});

app.post('/userAllPastReservations', function (req, res) {
    let bid = req.body.bid;
    let orderBy = req.body.orderBy;

    connection.query(`call userAllPastReservations(${bid},${orderBy})`, function(error, results, fields){
        if(error) throw error;
        console.log('Connected');
        res.send(results[0]);
    });
});

app.post('/editReservation', function (req, res) {
    let recordID = req.body.recordID;
    let start_datetime = req.body.start_datetime;
    let end_datetime = req.body.end_datetime;
    let title = req.body.title;
    let event_detail = req.body.event_detail;

    connection.query(`call editReservation(${recordID},"${start_datetime}","${end_datetime}","${title}","${event_detail}")`, function(error, results, fields){
        if(error) throw error;
        console.log('Connected');
        res.send(results[0]);
    });
});

app.post('/hours', function(req, res) {
    connection.query(`call availableHours( ${req.body.username}, '${req.body.room}',${req.body.building}, '${dateFormat(req.body.startDate, "yyyy-mm-dd hh:MM:ss")}' )`, function(error, results, fields){
        if(error) throw error;
        res.send(results[0][0]);
    });
});

app.post('/semester', function(req, res) {
    connection.query(`call getSemester(${req.body.building})`, function(error, results, fields){
        if(error) throw error;
        res.send(results[0][0]);
    });
});

app.post('/availableRooms', function(req, res){
    let startdate = moment(req.body.startDate).format('YYYY-MM-DD');
    let starttime = moment(req.body.startTime).format('HH:mm:ss');
    let endtime = moment(req.body.endTime).format('HH:mm:ss');

    connection.query(`call availableRooms(${req.body.username},${req.body.building},'${startdate + ' ' + starttime}', '${startdate + ' ' + endtime}')`, function(error, results, fields){
        if (error) throw error;

        res.send(results[0]);
    });
});

app.post('/insertReservations', async function(req, res){
    if(req.body.reservations.length > 1){
        let events = req.body.reservations;
        let firstEvent = events.shift();
        let start = moment(firstEvent.start).format('YYYY-MM-DD HH:mm:ss');
        let end = moment(firstEvent.end).format('YYYY-MM-DD HH:mm:ss');

        connection.query(`call firstRecurring(${req.body.username},${req.body.room},${req.body.building},'${start}','${end}','${req.body.title}','${req.body.description}')`,async function(error,results,fields) {
            if (error) throw error;

            const promises = events.map(async r => {
                start = moment(r.start).format('YYYY-MM-DD HH:mm:ss');
                end = moment(r.end).format('YYYY-MM-DD HH:mm:ss');

                return new Promise(function (resolve, reject) {
                    connection.query(`call insertReservation(${req.body.username},${req.body.room},${req.body.building},'${start}','${end}','${req.body.title}','${req.body.description}', ${results[0][0].recordID})`, function (error, results, fields) {
                        if (error) throw error;
                        resolve("Done");
                    });
                });
            });
            await(Promise.all(promises));
            console.log("promises done");
            res.send('Finished multi');
        });
    }
    else{
        let start = moment(req.body.reservations[0].start).format('YYYY-MM-DD HH:mm:ss');
        let end = moment(req.body.reservations[0].end).format('YYYY-MM-DD HH:mm:ss');

        connection.query(`call insertReservation(${req.body.username},${req.body.room},${req.body.building},'${start}','${end}','${req.body.title}','${req.body.description}', null)`,function(error,results,fields) {
            if(error) throw error;
            res.send("Finished single");
        })
    }
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

               resolve({
                   id: req.body.roomID,
                   title: req.body.title,
                   description: req.body.description,
                   start: startdate + ' ' + starttime,
                   end: startdate + ' ' + endtime,
                   valid: results[0][0]
               });
           });
       })

   });
    let hold = await(Promise.all(promises));

    res.send(hold);
});

app.post('/verifyEditReservations', async function(req, res) {
    let startdate, starttime, endtime;

    const promises = req.body.reservations.map(async r =>{
        startdate = moment(r).format('YYYY-MM-DD');
        starttime = moment(req.body.startTime).format('HH:mm:ss');
        endtime = moment(req.body.endTime).format('HH:mm:ss');

        return new Promise(function(resolve,reject) {
            connection.query(`call verifyEditReservation(${req.body.username},${req.body.building},'${startdate + ' ' + starttime}', '${startdate + ' ' + endtime}', ${req.body.roomID}, ${req.body.recordID})`, function (error, results, fields) {
                if (error) throw error;

                //Since this is asynchronous to the map assignment, reassign to get correct values
                startdate = moment(r).format('YYYY-MM-DD');
                starttime = moment(req.body.startTime).format('HH:mm:ss');
                endtime = moment(req.body.endTime).format('HH:mm:ss');

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
    res.send(hold);
});

app.post('/removeEvent', function(req, res) {
    let recordID = req.body.recordID;

    connection.query(`call removeEvent(${recordID})`, function(error, results, fields){
        if(error) throw error;
        res.send(results[0]);
    });
});

app.listen(5000, () => {
    console.log('Running on port 5000');
});