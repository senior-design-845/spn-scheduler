//Run with node.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const moment = require('moment');
const connection = mysql.createConnection({
    host    : 'sakila.chloiuzfkxyi.us-west-2.rds.amazonaws.com',
    user    : 'root',
    password: 'Kkk11121',
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

/*app.get('/', function(req, res) {
       connection.query('call calendarDisplay(1,1)', function(err, data) {
           (err)? res.send(err) : res.json({schedule :data});
       });
});*/

app.post('/calendar', function (req, res) {

    connection.query(`call calendarDisplay(${req.body.userID},${req.body.buildingID})`, function(error, results, fields){
        if(error) res.send(error);
        else {
            console.log('Connected');
            res.send(results[0]);
        }
    });
});

app.post('/login', function(req, res) {
    let nid = req.body.netid;

    connection.query(`call netidVerification("${nid}")`, function(error, results, fields){
        if(error) res.send(error);
        else {
            console.log('Connected');
            res.send(results[0]);
        }
    });
});

app.post('/getBuildings', function(req, res) {
    let uid = req.body.userID;

    connection.query(`call userBuildings(${uid})`, function(error, results, fields){
        if(error) res.send(error);
        else {
            console.log('Connected');
            res.send(results[0]);
        }
    });
});

app.post('/email', function (req,res){
    let emailMessage = `${req.body.room} was successfully reserved!\nEvent Title: ${req.body.title}\nEvent Description: ${req.body.description}\n\nTimes:\n`;
    req.body.reservations.map(r => {
        emailMessage += `Start: ${moment(r.start).format('LLLL')}\n`;
        emailMessage += `End: ${moment(r.end).format('LLLL')}\n\n`;
    });

    emailMessage += "\u2022Please by sure the room is tidy and clean when you leave.\n";
    emailMessage += "\t\u2022 Trash in trash cans\n";
    emailMessage += "\t\u2022 Chairs pushed in\n";
    emailMessage += "\t\u2022 Projectors/monitors turned off\n";
    emailMessage += "\t\u2022 Whiteboards erased\n";
    emailMessage += "\u2022Finish your meeting on time";
    emailMessage += "\n\nIf you have any questions email utdesign@utdallas.edu";


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
        to: req.body.email,
        subject: 'Room Confirmation',
        text: emailMessage
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err);
        else
            console.log(info);
    });

    res.send("Email sent");


});

app.post('/adminTables', function(req, res) {
    let table = req.body.table;
    switch(table){
        case 'Users': table = 'getUsers'; break;
        case 'User Classifications': table = 'getUserClass'; break;
        case 'Classifications': table = 'getClassifications'; break;
        case 'Room Classifications': table = 'getRoomClass'; break;
        case 'Rooms': table = 'getRooms'; break;
        case 'Building Configurations': table = 'getBuildingConfigurations'; break;
    }

    connection.query(`call ${table}()`, function(error,results,fields){
       if(error) res.send(error);
       else
           res.send(results[0]);
    });
});

app.post('/userReservations', function (req, res) {
    let uid = req.body.uid;
    let bid = req.body.bid;
    let orderBy = req.body.orderBy;

    connection.query(`call userReservations(${uid},${bid},${orderBy})`, function(error, results, fields){
        if(error) res.send(error);
        else {
            console.log('Connected');
            res.send(results[0]);
        }
    });
});

app.post('/userAllReservations', function (req, res) {
    let bid = req.body.bid;
    let orderBy = req.body.orderBy;

    connection.query(`call userAllReservations(${bid},${orderBy})`, function(error, results, fields){
        if(error) res.send(error);
        else {
            console.log('Connected');
            res.send(results[0]);
        }
    });
});

app.post('/searchReservations', function (req, res) {
    let searchTerm = req.body.searchTerm;
    let bid = req.body.bid;
    let orderBy = req.body.orderBy;

    connection.query(`call searchReservations('%${searchTerm}%',${bid},${orderBy})`, function(error, results, fields){
        if(error) res.send(error);
        else {
            console.log('Connected');
            res.send(results[0]);
        }
    });
});

app.post('/editReservation', function (req, res) {
    let recordID = req.body.recordID;
    let start_datetime = req.body.start_datetime;
    let end_datetime = req.body.end_datetime;
    let title = req.body.title;
    let event_detail = req.body.event_detail;

    connection.query(`call editReservation(${recordID},"${start_datetime}","${end_datetime}","${title}","${event_detail}")`, function(error, results, fields){
        if(error) res.send(error);
        else {
            console.log('Connected');
            res.send(results[0]);
        }
    });
});

app.post('/addRoom', function(req, res) {
    let wdstart = moment(req.body.wdstart).format('HH:mm:ss');
    let wdend = moment(req.body.wdend).format('HH:mm:ss');
    let westart = moment(req.body.westart).format('HH:mm:ss');
    let weend = moment(req.body.weend).format('HH:mm:ss');

    connection.query(`call insertRoom(${req.body.building}, '${req.body.room}', '${wdstart}', '${wdend}', '${westart}', '${weend}', ${req.body.roomClass})`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }

        res.send('Accepted')
    });
});
app.post('/updateRoom', function(req, res) {
    let wdstart = moment(req.body.wdstart).format('HH:mm:ss');
    let wdend = moment(req.body.wdend).format('HH:mm:ss');
    let westart = moment(req.body.westart).format('HH:mm:ss');
    let weend = moment(req.body.weend).format('HH:mm:ss');
    connection.query(`call editRoom(${req.body.roomID}, ${req.body.building}, '${req.body.room}','${wdstart}', '${wdend}', '${westart}', '${weend}')`, function(error,results,fields){
        if(error) {
            console.log(error)
            res.send('Error');
            return;
        }
        res.send('Accepted')
    });
});

app.post('/deleteRoom', function(req, res) {
   connection.query(`call removeRoom(${req.body.roomID},${req.body.inactive})`, function(error,results,fields){

       if(error){
          console.log(error);
          res.send('Error');
          return;
      }
      res.send('Accepted');
   });
});

app.post('/addUser', function(req, res) {
    connection.query(`call insertUser('${req.body.netID}', '${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.course}', '${req.body.teamNumber}', ${req.body.userClass})`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }

        res.send('Accepted')
    });
});
app.post('/updateUser', function(req, res) {

    connection.query(`call editUser(${req.body.userID},'${req.body.netID}', '${req.body.firstName}', '${req.body.lastName}', '${req.body.email}', '${req.body.course}', '${req.body.teamNumber}')`, function(error,results,fields){
        if(error) {
            console.log(error)
            res.send('Error');
            return;
        }
        res.send('Accepted')
    });
});

app.post('/deleteUser', function(req, res) {
    connection.query(`call removeUser(${req.body.userID},${req.body.inactive})`, function(error,results,fields){

        if(error){
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted');
    });
});

app.post('/addBuilding', function(req, res) {
    let start = moment(req.body.semesterStart).format('YYYY-MM-DD');
    let end = moment(req.body.semesterEnd).format('YYYY-MM-DD');

    connection.query(`call insertBuilding('${req.body.buildingName}', '${start}', '${end}', '${req.body.dailyLimit}', '${req.body.weeklyLimit}')`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }

        res.send('Accepted')
    });
});
app.post('/updateBuilding', function(req, res) {
    let start = moment(req.body.semesterStart).format('YYYY-MM-DD');
    let end = moment(req.body.semesterEnd).format('YYYY-MM-DD');
    connection.query(`call editBuildingConfig(${req.body.buildingID},'${req.body.buildingName}', '${start}', '${end}', '${req.body.dailyLimit}', '${req.body.weeklyLimit}')`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted')
    });
});

app.post('/deleteBuilding', function(req, res) {
    connection.query(`call removeBuilding(${req.body.buildingID},${req.body.inactive})`, function(error,results,fields){
        if(error){
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted');
    });
});

app.post('/addUserClass', function(req, res) {
    connection.query(`call insertUserClass(${req.body.classID},${req.body.userID})`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }

        res.send('Accepted')
    });
});
app.post('/updateUserClass', function(req, res) {

    connection.query(`call editUserClass(${req.body.oldclassID},${req.body.newclassID},${req.body.userID})`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted')
    });
});

app.post('/deleteUserClass', function(req, res) {
    connection.query(`call removeUserClass(${req.body.classID},${req.body.userID},${req.body.inactive})`, function(error,results,fields){
        if(error){
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted');
    });
});

app.post('/addClass', function(req, res) {
    connection.query(`call insertClass('${req.body.detail}')`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }

        res.send('Accepted')
    });
});
app.post('/updateClass', function(req, res) {

    connection.query(`call editClass(${req.body.classID},'${req.body.detail}')`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted')
    });
});

app.post('/deleteClass', function(req, res) {
    connection.query(`call removeClass(${req.body.classID},${req.body.inactive})`, function(error,results,fields){
        if(error){
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted');
    });
});

app.post('/addRoomClass', function(req, res) {
    connection.query(`call insertRoomClass(${req.body.roomID}, ${req.body.classID}, ${req.body.buildingID})`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }

        res.send('Accepted')
    });
});
app.post('/updateRoomClass', function(req, res) {

    connection.query(`call editRoomClass(${req.body.roomID}, ${req.body.oldclassID}, ${req.body.newclassID})`, function(error,results,fields){
        if(error) {
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted')
    });
});

app.post('/deleteRoomClass', function(req, res) {
    connection.query(`call removeRoomClass(${req.body.roomID}, ${req.body.classID}, ${req.body.inactive})`, function(error,results,fields){
        if(error){
            console.log(error);
            res.send('Error');
            return;
        }
        res.send('Accepted');
    });
});

app.post('/hours', function(req, res) {
    connection.query(`call availableHours( ${req.body.username}, '${req.body.room}',${req.body.building}, '${dateFormat(req.body.startDate, "yyyy-mm-dd hh:MM:ss")}' )`, function(error, results, fields){
        if(error) res.send(error);
        else
            res.send(results[0][0]);
    });
});

app.post('/semester', function(req, res) {
    connection.query(`call getSemester(${req.body.building})`, function(error, results, fields){
        if(error) res.send(error);
        else
            res.send(results[0][0]);
    });
});

app.post('/availableRooms', function(req, res){
    let startdate = moment(req.body.startDate).format('YYYY-MM-DD');
    let starttime = moment(req.body.startTime).format('HH:mm:ss');
    let endtime = moment(req.body.endTime).format('HH:mm:ss');

    connection.query(`call availableRooms(${req.body.username},${req.body.building},'${startdate + ' ' + starttime}', '${startdate + ' ' + endtime}')`, function(error, results, fields){
        if (error) res.send(error);
        else
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
            if (error) res.send(error);
            else {
                //Send the rest of the reservations to be inserted, make them a promise so that they can be waited on as .query is asynchronous
                const promises = events.map(async r => {
                    start = moment(r.start).format('YYYY-MM-DD HH:mm:ss');
                    end = moment(r.end).format('YYYY-MM-DD HH:mm:ss');

                    return new Promise(function (resolve, reject) {
                        connection.query(`call insertReservation(${req.body.username},${req.body.room},${req.body.building},'${start}','${end}','${req.body.title}','${req.body.description}', ${results[0][0].recordID})`, function (error, results, fields) {
                            if (error) res.send(error);
                            resolve("Done");
                        });
                    });
                });
                await (Promise.all(promises));
                console.log("promises done");
                res.send('Finished multi');
            }
        });
    }
    else{
        let start = moment(req.body.reservations[0].start).format('YYYY-MM-DD HH:mm:ss');
        let end = moment(req.body.reservations[0].end).format('YYYY-MM-DD HH:mm:ss');

        connection.query(`call insertReservation(${req.body.username},${req.body.room},${req.body.building},'${start}','${end}','${req.body.title}','${req.body.description}', null)`,function(error,results,fields) {
            if(error) res.send(error);
            else
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
               if (error) res.send(error);
               else {
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
               }
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
                if (error) res.send(error);
                else {
                    //Since this is asynchronous to the map assignment, reassign to get correct values
                    startdate = moment(r).format('YYYY-MM-DD');
                    starttime = moment(req.body.startTime).format('HH:mm:ss');
                    endtime = moment(req.body.endTime).format('HH:mm:ss');

                    resolve({
                        id: req.body.roomID,
                        title: 'NEW RESERVATION',
                        start: startdate + ' ' + starttime,
                        end: startdate + ' ' + endtime,
                        valid: results[0][0]
                    });
                }
            });
        })

    });
    let hold = await(Promise.all(promises));
    res.send(hold);
});

app.post('/removeEvent', function(req, res) {
    let recordID = req.body.recordID;

    connection.query(`call removeEvent(${recordID})`, function(error, results, fields){
        if(error) res.send(error);
        else
            res.send(results[0]);
    });
});

app.get('/deleteStudents', function(req, res){
    connection.query('call removeStudents()', function(error, results, fields){
       if(error) {
           res.send("Error");
       }
       res.send("Finished");
    });
});

app.listen(5000, () => {
    console.log('Running on port 5000');
});
