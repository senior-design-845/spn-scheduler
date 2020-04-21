import React, { Component } from 'react';
import './EditReservations.css'
import moment from 'moment'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import Dropdown from 'react-dropdown';
import { Sticky, StickyContainer } from 'react-sticky';

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID: this.props.location.state.userID,
            userClass: this.props.location.state.classID,
            buildingID: this.props.location.state.buildingID,
            orderBy: 1,
            events: [],
            allReservations: false,
            showPastRes: false,
            filter: 'Date',
        };

        // Initialization of all functions
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

    // Creation of each individual list item.
    createItem(item) {
        console.log(this.state.userClass, ' ', this.state.userID);
        return (
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

    // Function to create all list items based on returned criteria
    createItems(items) {
        return (items.map(this.createItem));
    }

    // Function to return all reservations in the 'schedule' table based
    // on userID, buildingID, and list order
    getReservations(orderBy) {
        // Set saved events to 'null' to re-render data
        this.setState({ events: [] });

        // Determine how to filter received data
        let filter = 0;
        if (!Number.isInteger(orderBy)) {
            filter = this.state.orderBy;
        }
        else {
            filter = orderBy;
        }

        // Calling 'userReservations()' stored proc from server to
        // retrieve all reservations for this user
        // Sent info: userID, buildingID, orderBy
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
            .then(response => {
                try {
                    return response.json();
                }
                catch {
                    alert('Invalid Server Response')
                }
            })
            .then(reservations => {
                try {
                    let events = [];
                    // Record all information for the reservations received from SQL proc
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

                    // Update new events and re-render
                    this.setState({ events: events });
                }
                catch {
                    alert('Invalid Server Response')
                }
            });

    }

    // Function to retrieve all active reservations in the database
    // based on userID and buildingID
    handleAllRes(orderBy) {
        // Set 'events' state to 'null' to re-render and remove old events
        this.setState({ events: [], allReservations: true });

        // Determine how to order results
        console.log(orderBy);
        let filter = 0;
        if (!Number.isInteger(orderBy)) {
            filter = this.state.orderBy;
        }
        else {
            filter = orderBy;
        }
        console.log(filter);

        // Call 'userAllReservations()' stored proc from the server
        // Send: userID, buildingID
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
            .then(response => {
                try {

                    return response.json()
                }
                catch {
                    alert('Invalid Server Response')
                }
            })
            .then(reservations => {
                try {
                    let events = [];

                    // Save all reservations returned by the stored procedure
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

                    // Update state with new events and re-render
                    this.setState({ events: events });
                }
                catch {
                    alert('Invalid Server Response');
                }
            });
    }

    // Function for 'My Reservations' button, which shows only reservations
    // owned by the current user
    handleMyRes() {
        this.setState({ allReservations: false });

        this.getReservations();
    }

    // Function for 'Show Previous' button which shows events from the past
    handlePastRes() {
        this.setState({ showPastRes: true });
    }

    // Function for 'Hide Previous' button which hides past events
    handleHidePast() {
        this.setState({ showPastRes: false });
    }

    // Function to evaluate and save any changed info inside of a text box
    handleChange(event) {
        return this.setState({ [event.target.name]: event.target.value });
    }

    // Function to determine which filter the user has applied to the data
    // 'Sort <dropdown>'
    handleFilter(option) {
        let orderBy = 0
        switch (option.value) {
            case 'Date':
                this.setState({ filter: 'Date', orderBy: 1 });
                orderBy = 1;
                break;
            case 'Room':
                this.setState({ filter: 'Room', orderBy: 2 });
                orderBy = 2;
                break;
            case 'Name':
                this.setState({ filter: 'Name', orderBy: 3 });
                orderBy = 3;
                break;
            case 'Course':
                this.setState({ filter: 'Course', orderBy: 4 });
                orderBy = 4;
                break;
            case 'Project #':
                this.setState({ filter: 'Project #', orderBy: 5 });
                orderBy = 5;
                break;
            case 'NetID':
                this.setState({ filter: 'NetID', orderBy: 6 });
                orderBy = 6;
                break;
        }
        //['Date', 'Room', 'Name', 'Course', 'Project #', 'NetID']

        // Determine whether or not user has selected 'All Reservations'
        if (this.state.allReservations) {
            this.handleAllRes(orderBy);
        }
        else {
            this.getReservations(orderBy);
        }
    }

    // Function to handle a submitted search
    handleSearch(term) {
        // Prevents page from reloading
        term.preventDefault();

        // Only allow letters and numbers to be submitted
        if (this.state.searchTerm == null || !(this.state.searchTerm).match("^[A-z0-9]+$")) {
            return;
        }

        // Empty event state to re-render events
        this.setState({ events: [] });

        // Server call to call 'searchReservations()' stored proc
        // Send: searchTerm, buildingID, orderBy
        // Return: Events matching the search term
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
            .then(response => {
                try {
                    return response.json();
                }
                catch {
                    alert('Invalid Server Response');
                }
            })
            .then(reservations => {
                try {
                    let events = [];

                    // Save information from all events returned from stored proc
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

                    // Update event state and re-render
                    this.setState({ events: events });
                }
                catch {
                    alert('Invalid Server Response');
                }
            });
    }

    // Function called upon page load
    componentDidMount() {
        this.getReservations();
    }

    render() {
        // Possible options for 'Sort' filter
        let filterOptions = ['Date', 'Room', 'Name', 'Course', 'Project #', 'NetID'];

        return (
            <div>
                {/* Set background color of page */}
                <style>
                    {document.body.style = 'background: white;'}
                </style>
                {/* Links for routing to other pages */}
                <div id='routing-table'>
                    <Link id="link" to={{
                        pathname: '/calendar',
                        state: this.props.location.state
                    }}>Calendar</Link>
                    <br />
                    {
                        /* Only show admin button if user is admin */
                        this.state.userClass === 1 ? (
                            <Link id="link" to={{
                                pathname: '/admin',
                                state: this.props.location.state
                            }}>Admin</Link>
                        ) : (null)
                    }
                    <br />
                    <Link id="link" to={'/login'}>Logout</Link>
                </div>
                {/* Strip for title at top of the page */}
                <div className='page-title-strip'>My Reservations</div>
                <div id='reservation-buttons'>
                    {
                        // Show these two buttons if user is Admin
                        this.state.userClass === 1 ? (
                            <div id='admin-buttons'>
                                <button onClick={this.handleAllRes}>All Reservations</button>
                                <button onClick={this.handleMyRes} > My Reservations</button>
                                <br />
                            </div>
                        ) : null
                    }
                    {
                        // Toggle between past and present reservation buttons
                        !this.state.showPastRes ? (
                            <button onClick={this.handlePastRes}>Show Previous</button>
                        ) : (
                                <button onClick={this.handleHidePast}>Hide Previous</button>
                            )
                    }
                </div>
                <div>
                    {
                        // Show search box and sort menu if user is Admin
                        this.state.userClass === 1 ? (
                            <div>
                                <form id='search-box' onSubmit={this.handleSearch}>
                                    <label>
                                        Search:
                                        <input name='searchTerm' onChange={this.handleChange} type="text" />
                                    </label>
                                    <input type="submit" value="Search" />
                                </form>
                                <div id='dropdown-filter'>
                                    Sort: <Dropdown options={filterOptions} onChange={this.handleFilter} value={this.state.filter} placeholder={"Date"} />
                                </div>
                            </div>
                        ) : (null)
                    }
                </div>
                {/* Container for frozen object on page */}
                <StickyContainer>
                    <Sticky>
                        {({
                            style
                        }) => (
                                <header style={style}>
                                    {
                                        // Top table showing event attribute titles (frozen)
                                        <div className='event-list-wrapper'>
                                            <div id='sticky-header'>
                                                <div className='header-item'>
                                                    <div>Room</div>
                                                </div>
                                                <div className='header-item'>
                                                    <div>Date</div>
                                                </div>
                                                <div className='header-item'>
                                                    <div>Time</div>
                                                </div>
                                                <div className='header-item'>
                                                    <div>Title</div>
                                                </div>
                                                <div className='header-item'>
                                                    <div>Project#</div>
                                                </div>
                                                <div className='header-item'>
                                                    <div>Name</div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </header>
                            )}
                    </Sticky>
                    {
                        // Originating function to create all events on page
                        <div ref='events' className='event-list-wrapper'>
                            {this.createItems(this.state.events)}
                        </div>
                    }
                </StickyContainer>
            </div>
        );
    }
}

class EventDropdown extends Component {
    constructor(props) {
        super(props);

        let currentEvent = this.props.event;

        // Date formatting for different states
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
        if (dateObjectStart < (new Date())) { previous = true; background = 'grey'; }

        // Initialize all functions
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

    // This function will be called if it's parent 'EditReservations' sends
    // updated properties
    componentWillReceiveProps(nextProps) {
        this.setState({
            eventObject: nextProps.event,
            userClass: nextProps.userClass,
            userID: nextProps.userID,
            buildingID: nextProps.buildingID,
            showPastRes: nextProps.showPastRes,
            orderBy: nextProps.orderBy,
        });
    }

    // Function to show event dropdown if event is clicked
    showDDContent(event) {
        event.preventDefault();

        this.setState({ showDDContent: true }, () => {
            if (!this.state.ddEditClick)
                document.addEventListener('click', this.closeDDContent);
        });
    }

    // Function to close event dropdown if anywhere else is clicked
    closeDDContent(event) {
        if (this.dropdownMenu === null) {
            {
                this.setState({ showDDContent: false }, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else
            if (!this.dropdownMenu.contains(event.target)) {
                this.setState({ showDDContent: false }, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
    }

    // Handler function for 'Edit' button
    ddEditClick(event) {
        this.setState({ showDDContent: true, ddEditClick: true }, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    // Function for the 'cancel' button, returns everything to its default setting
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

    // Function to convert a date to a MySQL-formatted date
    convertUTCDate(rawDate) {
        let rawDateSplit = rawDate.split(/[- :T]/);
        let t = rawDateSplit.map(item => parseInt(item, 10));

        return (new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5])));
    }

    // Function to return a full DateTime string based on separate date and time
    convertDateTime(rawDate, rawTime) {
        let stringDate = moment(rawDate).format('YYYY-MM-DD');
        let stringTime = moment(rawTime).format('HH:mm:ss');

        let fullString = stringDate + ' ' + stringTime;

        return fullString;
    }

    // Function to convert a Date() object to string format
    convertDate(rawDate) {
        let stringDate = moment(rawDate).format('YYYY-MM-DD HH:mm:ss');

        return stringDate;
    }

    // Handles change and saves info within any text box
    handleChange(event) {
        return this.setState({ [event.target.name]: event.target.value });
    }

    // Handler function for change in the DatePicker
    handleDateChange(date) {
        this.setState({ tempDate: date });
    }

    // Handler function for change in start time
    handleStartTimeChange(time) {
        console.log(new Date(new Date(time).setMinutes(time.getMinutes() + 30)));

        this.setState({
            tempStartTime: time,
            minTime: (new Date(new Date(time).setMinutes(time.getMinutes() + 30))),
            //maxTime: (new Date(new Date(time).setHours(time.getHours() + 2))),
            tempEndTime: new Date(new Date(time).setMinutes(time.getMinutes() + 30)),
        });
    }

    // Handler function for change in end time
    handleEndTimeChange(time) {
        this.setState({ tempEndTime: time });
    }

    // Handler function for pressing 'delete' button
    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({ deleteClick: true });
    }

    // Handler function for pressing 'CONFIRM DELETE' button
    handleDeleteConfirm(event) {
        event.preventDefault();

        // Calls 'removeEvent()' stored proc from server based on
        // recordID (lazy deletion)
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

    // Handler function for submission of data editing a reservation
    handleSubmit(event) {
        // Prevents reload of page
        event.preventDefault();

        let eventArray = [];
        eventArray[0] = this.state.tempDate;

        // Call 'verifyEditReservations()' stored proc from the server
        // Send: recordID, startTime, endTime, userID, buildingID, roomID, Date
        // Returns: whether or not the edits are valid
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
            .then(response => {
                try {

                    return response.json();
                }
                catch{
                    alert('Invalid Server Response')
                }
            })
            .then(record => {
                try {
                    this.setState({
                        dateConflict: false,
                        dailyConflict: false,
                        weeklyConflict: false,
                    });

                    let conflict = record[0].valid.conflict;
                    let dailyOver = record[0].valid.dailyOver;
                    let weeklyOver = record[0].valid.weeklyOver;

                    // Checks to determine whether:
                    // - changed event conflicts with another event
                    // - user is over daily hour limit
                    // - user is over weekly hour limit
                    if (conflict > 0) {
                        this.setState({ dateConflict: true });
                    } else if (dailyOver > 0 && this.state.userClass !== 1) {
                        this.setState({ dailyConflict: true })
                    } else if (weeklyOver > 0 && this.state.userClass !== 1) {
                        this.setState({ weeklyConflict: true })
                    } else {
                        // If event edits are valid -> make changes to event
                        // Send: new info for event
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
                            .then(() => {
                                // Reload page so event info can be updated
                                window.location.reload();
                            })
                    }
                }
                catch {
                    alert('Invalid Server Response')
                }
            });

    }

    render() {
        return (
            // The shown portion of the individual events
            <div className='dd-list-container' style={{ 'background': this.state.background }}>
                {
                    !this.state.showPastRes && this.state.previous ? (null) : (
                        <div>
                            {/* Shows information regarding the events */}
                            <div className='dd-list-header' onClick={this.showDDContent}>
                                <div className='event-item'>
                                    <div>{this.state.room_name}</div>
                                </div>
                                <div className='event-item'>
                                    <div>{this.state.startDate}</div>
                                </div>
                                <div className='event-item'>
                                    <div>{this.state.startTime} - {this.state.endTime}</div>
                                </div>
                                <div className='event-item'>
                                    <div>{this.state.title}</div>
                                </div>
                                <div className='event-item'>
                                    <div>{this.state.team_num}</div>
                                </div>
                                <div className='event-item'>
                                    <div>{this.state.last_name}, {this.state.first_name}</div>
                                </div>
                            </div>
                            {
                                // All extra information displayed when an event is clicked
                                this.state.showDDContent ? (
                                    <div className='dd-list-content' ref={(element) => { this.dropdownMenu = element; }}>

                                        <div className='dd-list-items'>
                                            Description: {this.state.description}
                                        </div>
                                        <div className='dd-list-items'>
                                            NetID: {this.state.netID}
                                        </div>
                                        <div className='dd-list-items'>
                                            Course: {this.state.course}
                                        </div>
                                        <div className='dd-list-items'>
                                            Email: {this.state.email}
                                        </div>
                                        {
                                            !this.state.previous ? (
                                                !this.state.ddEditClick ? (
                                                    <button className='dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                                ) : (
                                                        // Form that is shown when the 'Edit' button is clicked
                                                        <div className='dd-form-content'>
                                                            <form className='dd-edit-form' onSubmit={this.handleSubmit}>
                                                                <label className='dd-edit-item'>
                                                                    Title:
                                                            <input name='tempTitle' type="text" value={this.state.tempTitle} onChange={this.handleChange} />
                                                                </label>
                                                                <label className='dd-edit-item'>
                                                                    Description:
                                                            <input name='tempDescription' type="text" value={this.state.tempDescription} onChange={this.handleChange} />
                                                                </label>
                                                                <label className='dd-edit-item'>
                                                                    Date :
                                                            <DatePicker
                                                                        name='tempStartDate'
                                                                        selected={this.state.tempDate}
                                                                        onChange={this.handleDateChange}
                                                                        timeIntervals={30}
                                                                        dateFormat="MMMM d, yyyy"
                                                                        timeCaption="Start"
                                                                    />
                                                                </label>
                                                                <label className='dd-edit-item'>
                                                                    Start Time :
                                                            <DatePicker
                                                                        name='tempStartTime'
                                                                        selected={this.state.tempStartTime}
                                                                        onChange={this.handleStartTimeChange}
                                                                        showTimeSelect
                                                                        showTimeSelectOnly
                                                                        timeIntervals={30}
                                                                        dateFormat="h:mm aa"
                                                                        timeCaption="Start"
                                                                    />
                                                                </label>
                                                                <label className='dd-edit-item'>
                                                                    End Time :
                                                            <DatePicker
                                                                        name='tempEndTime'
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
                                                                    // Toggle between 'Delete' and 'CONFIRM DELETE'
                                                                    !this.state.deleteClick ? (
                                                                        <button onClick={this.handleDeleteClick}>Delete</button>
                                                                    ) : (
                                                                            <button onClick={this.handleDeleteConfirm} style={{ 'color': 'white', 'background': 'red' }}>CONFIRM DELETE</button>
                                                                        )
                                                                }
                                                            </form>
                                                            {/* Display any conflicts encountered */}
                                                            {
                                                                this.state.dateConflict ? (
                                                                    <div id='date-conflict-error' style={{ 'color': 'red' }}>
                                                                        Date conflicts with another event
                                                                    </div>
                                                                ) : null
                                                            }
                                                            {
                                                                this.state.weeklyConflict ? (
                                                                    <div id='weekly-hour-error' style={{ 'color': 'red' }}>
                                                                        Your weekly hour limit has been reached
                                                                    </div>
                                                                ) : null
                                                            }
                                                            {
                                                                this.state.dailyConflict ? (
                                                                    <div id='daily-hour-error' style={{ 'color': 'red' }}>
                                                                        Your daily hour limit has been reached
                                                                    </div>
                                                                ) : null
                                                            }
                                                            {
                                                                this.state.invalidSub ? (
                                                                    <div id='invalid-submission-error' style={{ 'color': 'red' }}>
                                                                        Invalid submission
                                                                    </div>
                                                                ) : null
                                                            }
                                                            <button className='dd-cancel-button' onClick={this.ddCancelClick}>CANCEL</button>
                                                        </div>
                                                    )
                                            ) : (null)
                                        }

                                    </div>
                                ) : (null)
                            }
                        </div>
                    )
                }
            </div>
        );
    }
}

export default EditReservations;