import React, {Component} from 'react';
import './EditReservations.css'
import moment from 'moment'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {Link} from "react-router-dom";

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID : 1,
            userClass : 1,
            buildingID : 1,
            orderBy: 1,
            events : [],
            allReservations: false,
            showPastRes : false,
        };

        this.createItem = this.createItem.bind(this);
        this.createItems = this.createItems.bind(this);
        this.getReservations = this.getReservations.bind(this);
        this.handleAllRes = this.handleAllRes.bind(this);
        this.handleMyRes = this.handleMyRes.bind(this);
        this.handlePastRes = this.handlePastRes.bind(this);
        this.handleHidePast = this.handleHidePast.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    // This is the creation of the list items
    createItem(item) {
        return(
            <EventDropdown
                event={item}
                userClass={this.state.userClass}
                userID={this.state.userID}
                buildingID={this.state.buildingID}
            />
        )
    }

    createItems(items) {
        return(items.map(this.createItem));
    }

    getReservations(showPast) {
        //Get the room reservation data from the server
        this.setState({events : []});

        let previousRes = showPast || false;

        let procCall = '';
        if (previousRes) {
            procCall = '/userPastReservations';
        }
        else {
            procCall = '/userReservations'
        }

        fetch(procCall, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: this.state.userID,
                bid: this.state.buildingID,
                orderBy: this.state.orderBy,
            }),
        })
            .then(response => response.json())
            .then(reservations => {
                let events = [];

                reservations.map(record => {
                    events.push({
                        roomID: record.roomID,
                        start_datetime: record.start_datetime,
                        end_datetime: record.end_datetime,
                        title: record.title,
                        event_detail: record.event_detail,
                        recordID: record.recordID,
                        recurring_recordID: record.recurring_recordID,
                        room_name: record.room_name,
                    });
                    return null;
                });

                this.setState({events: events});
            });

    }

    handleAllRes(showPast) {
        this.setState({events : [], allReservations: true});

        let previousRes = showPast || false;

        console.log(previousRes);

        let procCall = '';
        if (previousRes) {
            procCall = '/userAllPastReservations';
        }
        else {
            procCall = '/userAllReservations'
        }

        fetch(procCall, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bid: this.state.buildingID,
                orderBy: this.state.orderBy,
            }),
        })
            .then(response => response.json())
            .then(reservations => {
                let events = [];

                reservations.map(record => {
                    events.push({
                        roomID: record.roomID,
                        start_datetime: record.start_datetime,
                        end_datetime: record.end_datetime,
                        title: record.title,
                        event_detail: record.event_detail,
                        recordID: record.recordID,
                        recurring_recordID: record.recurring_recordID,
                        room_name: record.room_name,
                    });
                    return null;
                });

                this.setState({events: events});
            });
    }

    handleMyRes() {
        this.setState({allReservations : false});

        this.getReservations();
    }

    handlePastRes() {
        this.setState({showPastRes : true});

        let showPast = true;
        if (this.state.allReservations) {
            this.handleAllRes(showPast);
        }
        else {
            this.getReservations(showPast);
        }
    }

    handleHidePast() {
        this.setState({showPastRes : false});

        if (this.state.allReservations) {
            this.handleAllRes();
        }
        else {
            this.getReservations();
        }
    }

    handleChange(event) {
        console.log('handle');
        return this.setState({[event.target.name]: event.target.value});
    }

    handleSearch(term) {
        term.preventDefault();

        this.setState({events : []});

        fetch('/searchReservations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                searchTerm: this.state.searchTerm,
                bid: this.state.buildingID,
                orderBy: this.state.orderBy,
            }),
        })
            .then(response => response.json())
            .then(reservations => {
                let events = [];

                reservations.map(record => {
                    events.push({
                        roomID: record.roomID,
                        start_datetime: record.start_datetime,
                        end_datetime: record.end_datetime,
                        title: record.title,
                        event_detail: record.event_detail,
                        recordID: record.recordID,
                        recurring_recordID: record.recurring_recordID,
                        room_name: record.room_name,
                    });
                    return null;
                });

                this.setState({events: events});
            });
    }

    componentDidMount() {
        this.getReservations();
    }

    render() {
        return(
            <div>
                <style>
                    {document.body.style = 'background: #43a047;'}
                </style>
                <div id = 'routing-table'>
                    <Link id="link" to="/calendar">Calendar</Link>
                    <br/>
                    {
                        this.state.userClass === 1 ? (
                            <Link id="link" to="/admin">Admin</Link>
                        ) : (null)
                    }
                </div>
                <div className = 'page-title'>My Reservations</div>
                <div id = 'reservation-buttons'>
                    {
                        this.state.userClass === 1 ? (
                            <div id = 'admin-buttons'>
                                <button onClick={this.handleAllRes}>All Reservations</button>
                                <button onClick = {this.handleMyRes} > My Reservations</button>
                                <br/>
                            </div>
                        ) : null
                    }
                    {
                        !this.state.showPastRes ? (
                            <button onClick={this.handlePastRes}>Show Previous</button>
                        ) : (
                            <button onClick={this.handleHidePast}>Hide Previous</button>
                        )
                    }
                </div>
                <form id = 'search-box' onSubmit={this.handleSearch}>
                    <label>
                        Search:
                        <input name='searchTerm' onChange={this.handleChange} type="text" />
                    </label>
                    <input type="submit" value="Search" />
                </form>
                <div ref = 'events' className = 'event-list-wrapper'>
                    {this.createItems(this.state.events)}
                </div>
            </div>
        );
    }
}

class EventDropdown extends Component {
    constructor(props) {
        super(props);

        let currentEvent = this.props.event;

        let rawDateStart = String(currentEvent.start_datetime);
        let rawDateEnd = String(currentEvent.end_datetime);

        let dateObjectStart = this.convertUTCDate(rawDateStart);
        let dateObjectEnd = this.convertUTCDate(rawDateEnd);

        moment.locale('en');
        let startDate = moment(dateObjectStart).format('LL');
        let startTime = moment(dateObjectStart).format('LT');
        let endTime = moment(dateObjectEnd).format('LT');

        let previous = false;
        let background = '#ffa726';
        if (dateObjectStart < (new Date())) {previous = true; background = 'grey';}

        console.log(dateObjectStart, (new Date()));

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);

        this.state = {
            eventObject: this.props.event,
            title: this.props.event.title,
            description: this.props.event.event_detail,
            dateObjectStart: dateObjectStart,
            dateObjectEnd: dateObjectEnd,
            startDate: startDate,
            startTime: startTime,
            endTime: endTime,
            room_name: this.props.event.room_name,
            roomID: this.props.event.roomID,
            recordID: this.props.event.recordID,
            buildingID: this.props.buildingID,
            tempDate: dateObjectStart,
            tempStartTime: dateObjectStart,
            tempEndTime: dateObjectEnd,
            tempTitle: this.props.event.title,
            tempDescription: this.props.event.event_detail,
            recurring: this.props.event.recurring_recordID,
            userClass: this.props.userClass,
            userID: this.props.userID,
            minTime: new Date(dateObjectStart).setMinutes(dateObjectStart.getMinutes() + 30),
            maxTime: new Date(dateObjectStart).setHours(dateObjectStart.getHours() + 2),
            dateConflict: false,
            weeklyConflict: false,
            dailyConflict: false,
            invalidSub: false,
            deleteClick: false,
            background: background,
            previous: previous,
        }
    }

    showDDContent(event){
        event.preventDefault();

        this.setState({showDDContent: true}, () => {
            if (!this.state.ddEditClick)
                document.addEventListener('click', this.closeDDContent);
        });
    }

    closeDDContent(event){
        if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick(event) {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick(event) {
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempDate: this.state.dateObjectStart,
            tempStartTime: this.state.dateObjectStart,
            tempEndTime: this.state.dateObjectEnd,
            tempTitle: this.state.title,
            tempDescription: this.state.description,
            minTime: new Date(this.state.dateObjectStart).setMinutes(this.state.dateObjectStart.getMinutes() + 30),
            maxTime: new Date(this.state.dateObjectStart).setHours(this.state.dateObjectStart.getHours() + 2),
            dateConflict: false,
            dailyConflict: false,
            weeklyConflict: false,
            deleteClick: false,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }

    convertUTCDate(rawDate) {
        let rawDateSplit = rawDate.split(/[- :T]/);
        let t = rawDateSplit.map(item => parseInt(item, 10));

        return (new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5])));
    }

    convertDateTime(rawDate, rawTime) {
        let stringDate = moment(rawDate).format('YYYY-MM-DD');
        let stringTime = moment(rawTime).format('HH:mm:ss');

        let fullString = stringDate + ' ' + stringTime;

        return fullString;
    }

    convertDate(rawDate) {
        let stringDate = moment(rawDate).format('YYYY-MM-DD HH:mm:ss');

        return stringDate;
    }

    handleChange(event) {
        return this.setState({[event.target.name]: event.target.value});
    }

    handleDateChange(date) {
        this.setState({tempDate: date});
    }

    handleStartTimeChange(time) {
        this.setState({
            tempStartTime: time,
            minTime: new Date(time).setMinutes(time.getMinutes() + 30),
            maxTime: new Date(time).setHours(time.getHours() + 2),
            tempEndTime: new Date(new Date(time).setMinutes(time.getMinutes() + 30)),
        });
    }

    handleEndTimeChange(time) {
        this.setState({tempEndTime: time});
    }

    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event) {
        event.preventDefault();

        fetch('/removeEvent', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recordID: this.state.recordID,
            }),
        })
            .then(() => {
                window.location.reload();
            });
    }

    handleSubmit(event) {
        event.preventDefault();

        let eventArray = [];
        eventArray[0] = this.state.tempDate;

        fetch('/verifyEditReservations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recordID: this.state.recordID,
                startTime: this.state.tempStartTime,
                endTime: this.state.tempEndTime,
                username: this.state.userID,
                building: this.state.buildingID,
                roomID: this.state.roomID,
                reservations: eventArray,
            }),
        })
            .then(response => response.json())
            .then(record => {
                this.setState({
                    dateConflict: false,
                    dailyConflict: false,
                    weeklyConflict: false,
                });

                let conflict = record[0].valid.conflict;
                let dailyOver = record[0].valid.dailyOver;
                let weeklyOver = record[0].valid.weeklyOver;

                if (conflict > 0) {
                    this.setState({dateConflict: true});
                }
                else if (dailyOver > 0 && this.state.userClass !== 1) {
                    this.setState({dailyConflict: true})
                }
                else if (weeklyOver > 0 && this.state.userClass !== 1) {
                    this.setState({weeklyConflict: true})
                }
                else {
                    fetch('/editReservation', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            recordID: this.state.recordID,
                            start_datetime: this.convertDateTime(this.state.tempDate, this.state.tempStartTime),
                            end_datetime: this.convertDateTime(this.state.tempDate, this.state.tempEndTime),
                            title: this.state.tempTitle,
                            event_detail: this.state.tempDescription,
                        }),
                    })
                        .then(response => {
                            window.location.reload();
                        })
                }
            });

    }

    render() {
        return(
            // The shown portion of the individual events
            <div className='dd-list-container' style={{'background': this.state.background}}>
                <div className = 'dd-list-header' onClick={this.showDDContent}>
                    <div className = 'event-item'>
                        Room: {this.state.room_name}
                    </div>
                    <div className = 'event-item'>
                        Date: {this.state.startDate}
                    </div>
                    <div className = 'event-item'>
                        Time: {this.state.startTime} - {this.state.endTime}
                    </div>
                    <div className = 'event-item'>
                        Title: {this.state.title}
                    </div>
                </div>
                {
                    this.state.showDDContent ? (
                        <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>

                            <div className = 'dd-list-items'>
                                Description: {this.state.description}
                            </div>
                            {
                                !this.state.previous ? (
                                    !this.state.ddEditClick ? (
                                        <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                    ) : (
                                        // Edit form for events shown on 'edit' click
                                        <div className = 'dd-form-content'>
                                            <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                                <label className = 'dd-edit-item'>
                                                    Title:
                                                    <input name = 'tempTitle' type="text" value={this.state.tempTitle} onChange={this.handleChange} />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    Description:
                                                    <input name = 'tempDescription' type="text" value={this.state.tempDescription} onChange={this.handleChange} />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    Date :
                                                    <DatePicker
                                                        name = 'tempStartDate'
                                                        selected={this.state.tempDate}
                                                        onChange={this.handleDateChange}
                                                        timeIntervals={30}
                                                        dateFormat="MMMM d, yyyy"
                                                        timeCaption="Start"
                                                    />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    Start Time :
                                                    <DatePicker
                                                        name = 'tempStartTime'
                                                        selected={this.state.tempStartTime}
                                                        onChange={this.handleStartTimeChange}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={30}
                                                        dateFormat="h:mm aa"
                                                        timeCaption="Start"
                                                    />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    End Time :
                                                    <DatePicker
                                                        name = 'tempEndTime'
                                                        selected={this.state.tempEndTime}
                                                        onChange={this.handleEndTimeChange}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        minTime={this.state.userClass === 3 ? this.state.minTime : null}
                                                        maxTime={this.state.userClass === 3 ? this.state.maxTime : null}
                                                        timeIntervals={30}
                                                        dateFormat="h:mm aa"
                                                        timeCaption="End"
                                                    />
                                                </label>
                                                <input type="submit" value="Submit" />
                                                {
                                                    !this.state.deleteClick ? (
                                                        <button onClick={this.handleDeleteClick}>Delete</button>
                                                    ) : (
                                                        <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM DELETE</button>
                                                    )
                                                }
                                            </form>
                                            {
                                                this.state.dateConflict ? (
                                                    <div id='date-conflict-error' style={{'color':'red'}}>
                                                        Date conflicts with another event
                                                    </div>
                                                ) : null
                                            }
                                            {
                                                this.state.weeklyConflict ? (
                                                    <div id = 'weekly-hour-error' style={{'color':'red'}}>
                                                        Your weekly hour limit has been reached
                                                    </div>
                                                ) : null
                                            }
                                            {
                                                this.state.dailyConflict ? (
                                                    <div id = 'daily-hour-error' style={{'color':'red'}}>
                                                        Your daily hour limit has been reached
                                                    </div>
                                                ) : null
                                            }
                                            {
                                                this.state.invalidSub ? (
                                                    <div id = 'invalid-submission-error' style={{'color':'red'}}>
                                                        Invalid submission
                                                    </div>
                                                ) : null
                                            }
                                            <button className = 'dd-cancel-button' onClick={this.ddCancelClick}>CANCEL</button>
                                        </div>
                                    )
                                ) : ( null )
                            }

                        </div>
                    ) : ( null )
                }
            </div>
        );
    }
}

export default EditReservations;