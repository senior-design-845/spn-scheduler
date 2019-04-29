import React, {Component} from 'react';
import './EditReservations.css'
import moment from 'moment'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {Link} from "react-router-dom";
import Dropdown from 'react-dropdown';

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID : this.props.location.state.userID,
            userClass : this.props.location.state.classID,
            buildingID : this.props.location.state.buildingID,
            orderBy: 1,
            events : [],
            allReservations: false,
            showPastRes : false,
            filter: 'Date',
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
        this.handleFilter = this.handleFilter.bind(this);
    }

    // This is the creation of the list items
    createItem(item) {
        console.log(this.state.userClass, ' ', this.state.userID);
        return(
            <EventDropdown
                event={item}
                userClass={this.state.userClass}
                userID={this.state.userID}
                buildingID={this.state.buildingID}
                showPastRes={this.state.showPastRes}
                orderBy={this.state.orderBy}
            />
        )
    }

    createItems(items) {
        return(items.map(this.createItem));
    }

    getReservations(orderBy) {
        //Get the room reservation data from the server
        this.setState({events : []});

        let filter = 0;
        if (!Number.isInteger(orderBy)) {
            filter = this.state.orderBy;
        }
        else {
            filter = orderBy;
        }

        fetch('/userReservations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: this.state.userID,
                bid: this.state.buildingID,
                orderBy: filter,
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
                        last_name: record.last_name,
                        first_name: record.first_name,
                        course: record.course,
                        email: record.email,
                        team_num: record.team_num,
                        netID: record.netID,
                    });
                    return null;
                });

                this.setState({events: events});
            });

    }

    handleAllRes(orderBy) {
        this.setState({events : [], allReservations: true});

        console.log(orderBy);
        let filter = 0;
        if (!Number.isInteger(orderBy)) {
            filter = this.state.orderBy;
        }
        else {
            filter = orderBy;
        }
        console.log(filter);

        fetch('/userAllReservations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bid: this.state.buildingID,
                orderBy: filter,
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
                        last_name: record.last_name,
                        first_name: record.first_name,
                        course: record.course,
                        email: record.email,
                        team_num: record.team_num,
                        netID: record.netID,
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
    }

    handleHidePast() {
        this.setState({showPastRes : false});
    }

    handleChange(event) {
        return this.setState({[event.target.name]: event.target.value});
    }

    handleFilter(option) {
        let orderBy = 0
        switch (option.value) {
            case 'Date':
                this.setState({filter: 'Date', orderBy: 1});
                orderBy = 1;
                break;
            case 'Room':
                this.setState({filter: 'Room', orderBy: 2});
                orderBy = 2;
                break;
            case 'Name':
                this.setState({filter: 'Name', orderBy: 3});
                orderBy = 3;
                break;
            case 'Course':
                this.setState({filter: 'Course', orderBy: 4});
                orderBy = 4;
                break;
            case 'Project #':
                this.setState({filter: 'Project #', orderBy: 5});
                orderBy = 5;
                break;
            case 'NetID':
                this.setState({filter: 'NetID', orderBy: 6});
                orderBy = 6;
                break;
        }
        //['Date', 'Room', 'Name', 'Course', 'Project #', 'NetID']

        if (this.state.allReservations) {
            this.handleAllRes(orderBy);
        }
        else {
            this.getReservations(orderBy);
        }
    }

    handleSearch(term) {
        term.preventDefault();

        if (this.state.searchTerm == null || !(this.state.searchTerm).match("^[A-z0-9]+$")) {
            return;
        }

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
                        last_name: record.last_name,
                        first_name: record.first_name,
                        course: record.course,
                        email: record.email,
                        team_num: record.team_num,
                        netID: record.netID,
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
        let filterOptions = ['Date', 'Room', 'Name', 'Course', 'Project #', 'NetID'];

        return(
            <div>
                <style>
                    {document.body.style = 'background: #008542;'}
                </style>
                <div id = 'routing-table'>
                    <Link id="link" to={{
                        pathname: '/calendar',
                        state: this.props.location.state
                    }}>Calendar</Link>
                    <br/>
                    {
                        this.state.userClass === 1 ? (
                            <Link id="link" to={{
                                pathname: '/admin',
                                state: this.props.location.state
                            }}>Admin</Link>
                        ) : (null)
                    }
                    <br/>
                    <Link id="link" to={'/login'}>Logout</Link>
                </div>
                <div className = 'page-title-strip'>My Reservations</div>
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
                <div>
                    {
                        this.state.userClass === 1 ? (
                            <div>
                                <form id = 'search-box' onSubmit={this.handleSearch}>
                                    <label>
                                        Search:
                                        <input name='searchTerm' onChange={this.handleChange} type="text" />
                                    </label>
                                    <input type="submit" value="Search" />
                                </form>
                                <div id='dropdown-filter'>
                                    Sort: <Dropdown options={filterOptions} onChange={this.handleFilter} value={this.state.filter} placeholder={"Date"}/>
                                </div>
                            </div>
                        ) : (null)
                    }
                </div>
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
        let background = '#00a1de';
        if (dateObjectStart < (new Date())) {previous = true; background = 'grey';}

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
            minTime: new Date(new Date(dateObjectStart).setMinutes(dateObjectStart.getMinutes() + 30)),
            maxTime: new Date(1, 1, 1, 23, 59, 59),
            dateConflict: false,
            weeklyConflict: false,
            dailyConflict: false,
            invalidSub: false,
            deleteClick: false,
            background: background,
            previous: previous,
            showPastRes: this.props.showPastRes,
            last_name: this.props.event.last_name,
            first_name: this.props.event.first_name,
            course: this.props.event.course,
            email: this.props.event.email,
            team_num: this.props.event.team_num,
            netID: this.props.event.netID,
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            eventObject : nextProps.event,
            userClass : nextProps.userClass,
            userID : nextProps.userID,
            buildingID : nextProps.buildingID,
            showPastRes : nextProps.showPastRes,
            orderBy: nextProps.orderBy,
        });
    }

    showDDContent(event){
        event.preventDefault();

        this.setState({showDDContent: true}, () => {
            if (!this.state.ddEditClick)
                document.addEventListener('click', this.closeDDContent);
        });
    }

    closeDDContent(event){
        if(this.dropdownMenu === null){
            {
                this.setState({showDDContent: false}, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else
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
            minTime: new Date(new Date(this.state.dateObjectStart).setMinutes(this.state.dateObjectStart.getMinutes() + 30)),
            maxTime: new Date('23:59:59'),
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
        console.log(new Date(new Date(time).setMinutes(time.getMinutes() + 30)));

        this.setState({
            tempStartTime: time,
            minTime: (new Date(new Date(time).setMinutes(time.getMinutes() + 30))),
            //maxTime: (new Date(new Date(time).setHours(time.getHours() + 2))),
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
            {
                !this.state.showPastRes && this.state.previous ? (null) : (
                    <div>
                        <div className = 'dd-list-header' onClick={this.showDDContent}>
                            <div className = 'event-item'>
                                <div>Room:</div>
                                <div>{this.state.room_name}</div>
                            </div>
                            <div className = 'event-item'>
                                <div>Date:</div>
                                <div>{this.state.startDate}</div>
                            </div>
                            <div className = 'event-item'>
                                <div>Time:</div>
                                <div>{this.state.startTime} - {this.state.endTime}</div>
                            </div>
                            <div className = 'event-item'>
                                <div>Title:</div>
                                <div>{this.state.title}</div>
                            </div>
                            <div className = 'event-item'>
                                <div>Project #:</div>
                                <div>{this.state.team_num}</div>
                            </div>
                            <div className = 'event-item'>
                                <div>Name:</div>
                                <div>{this.state.last_name}, {this.state.first_name}</div>
                            </div>
                        </div>
                        {
                            this.state.showDDContent ? (
                                <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>

                                    <div className = 'dd-list-items'>
                                        Description: {this.state.description}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        NetID: {this.state.netID}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        Course: {this.state.course}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        Email: {this.state.email}
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
                                                                minTime={this.state.minTime}
                                                                maxTime={this.state.maxTime}
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
                )
            }
            </div>
        );
    }
}

export default EditReservations;