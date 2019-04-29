import React, {Component} from 'react';
import './Admin.css'
import {Link} from "react-router-dom";
import Dropdown from 'react-dropdown';
import moment from "moment";
import DatePicker from "react-datepicker"


class Admin extends Component {
    constructor(props){
        super(props);
        this.state = {
            showTable: false,
            selectedTable: 'Please choose a table',
            tableData: [],
            hideInactive: true,
            deleteClick: false
        };

        this.handleTableChoice = this.handleTableChoice.bind(this);
        this.handleInactive = this.handleInactive.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
    }

    handleInactive(){
        this.setState(prevState => ({hideInactive: !prevState.hideInactive}));
    }
    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event){
        event.preventDefault();

    fetch('/deleteStudents')
        .then(response => response.text())
        .then(result => {
            if(result === "Error")
                alert("Invalid Submission");
            else
                window.location.reload();
        });
    }

    handleTableChoice(selected){
        fetch('/adminTables', {
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                table: selected.value
            })
        }).then(response => response.json())
            .then(data => {
                if(typeof data.errno === undefined)
                    alert(data.errno + ': ' + data.code);
                else
                    this.setState({
                        showTable: true,
                        selectedTable: selected.value,
                        tableData: data
                    });
            });
    }

    displayData(){
        if(this.state.selectedTable === "Rooms") {
            let events = [];
            events.push(
                <RoomDropdown
                add = {true}
                data = {null}
                />
            )
            events.push(
                this.state.tableData.map(row => {
                    if(!this.state.hideInactive || !row.deleted)
                        return <RoomDropdown
                            data = {row}
                            />
                })
            )
            return events;
        }
        else if(this.state.selectedTable === "Users"){
            let events = [];
            events.push(
                <UserDropdown
                add = {true}
                data = {null}
                />);
            events.push(this.state.tableData.map(row => {
                if(!this.state.hideInactive || !row.deleted)
                    return <UserDropdown
                        add = {false}
                        data = {row}
                    />
            }));
            return(events);
        }
        else if(this.state.selectedTable === "Building Configurations"){
            let events = [];
            events.push(
                <BuildingDropdown
                    add = {true}
                    data = {null}
                />);
            events.push(this.state.tableData.map(row => {
                if(!this.state.hideInactive || !row.deleted)
                    return <BuildingDropdown
                        add = {false}
                        data = {row}
                    />
            }));
            return(events);
        }
        else if(this.state.selectedTable === "User Classifications"){
            let events = [];
            events.push(
                <UserClassDropdown
                    add = {true}
                    data = {null}
                />
            )
            events.push(
                this.state.tableData.map(row => {
                    if(!this.state.hideInactive || !row.deleted)
                        return <UserClassDropdown
                            data = {row}
                        />
                })
            )
            return events;
        }
        else if(this.state.selectedTable === "Classifications"){
            let events = [];
            events.push(
                <ClassDropdown
                    add = {true}
                    data = {null}
                />
            )
            events.push(
                this.state.tableData.map(row => {
                    if(!this.state.hideInactive || !row.deleted)
                        return <ClassDropdown
                            data = {row}
                        />
                })
            )
            return events;
        }
        else if(this.state.selectedTable === "Room Classifications"){
            let events = [];
            events.push(
                <RoomClassDropdown
                    add = {true}
                    data = {null}
                />
            )
            events.push(
                this.state.tableData.map(row => {
                    if(!this.state.hideInactive || !row.deleted)
                        return <RoomClassDropdown
                            data = {row}
                        />
                })
            )
            return events;
        }
    }

    render() {
        let options = ['Users','User Classifications','Classifications','Room Classifications','Rooms','Building Configurations'];
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
                    <Link id="link" to={{
                        pathname: '/myreservations',
                        state: this.props.location.state
                    }}>My Reservations</Link>
                    <br/>
                    <Link id="link" to={'/login'}>Logout</Link>
                </div>
                <div className = 'page-title'>Administrator Actions</div>
                <Dropdown options={options} onChange={this.handleTableChoice} value={this.state.selectedTable}/>

                {
                    this.state.showTable ? (
                        <div>
                            <button className="float-right" onClick={this.handleInactive}>{this.state.hideInactive ? "Show All":"Hide Inactive"}</button>
                            {
                                this.state.selectedTable === "Users" ? (
                                    !this.state.deleteClick ? (
                                        <button onClick={this.handleDeleteClick}>Remove ALL Students</button>
                                    ) : (
                                        <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM</button>
                                    )
                                ) : null
                            }
                            {
                                this.displayData()
                            }
                        </div>
                    ) : null
                }
            </div>
        )
    }
}


class RoomDropdown extends Component {
    constructor(props) {
        super(props);

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
        this.handleWeekdayStart = this.handleWeekdayStart.bind(this);
        this.handleWeekdayEnd = this.handleWeekdayEnd.bind(this);
        this.handleWeekendStart = this.handleWeekendStart.bind(this);
        this.handleWeekendEnd = this.handleWeekendEnd.bind(this);

        let tempTime, tempDayStart, tempDayEnd, tempEndStart, tempEndEnd;
        if(this.props.data !== null) {
            tempTime = String(this.props.data.weekday_start).split(/[:]/);
            tempDayStart = new Date();
            tempDayStart.setMinutes(parseInt(tempTime[1], 10));
            tempDayStart.setHours(parseInt(tempTime[0], 10));
            tempDayEnd = new Date();
            tempTime = String(this.props.data.weekday_end).split(/[:]/);
            tempDayEnd.setMinutes(parseInt(tempTime[1], 10));
            tempDayEnd.setHours(parseInt(tempTime[0], 10));
            tempEndStart = new Date();
            tempTime = String(this.props.data.weekend_start).split(/[:]/);
            tempEndStart.setMinutes(parseInt(tempTime[1], 10));
            tempEndStart.setHours(parseInt(tempTime[0], 10));
            tempEndEnd = new Date();
            tempTime = String(this.props.data.weekend_end).split(/[:]/);
            tempEndEnd.setMinutes(parseInt(tempTime[1], 10));
            tempEndEnd.setHours(parseInt(tempTime[0], 10));
        }

        this.state = {
            room_name: this.props.data === null ? '' : this.props.data.room_name,
            tempRoomName: this.props.data === null ? '' : this.props.data.room_name,
            building_name: this.props.data === null ? null : this.props.data.building_name,
            roomID: this.props.data === null ? null : this.props.data.roomID,
            buildingID: this.props.data === null ? null : this.props.data.buildingID,
            weekday_start: this.props.data === null ? null : tempDayStart,
            weekday_end: this.props.data === null ? null : tempDayEnd,
            weekend_start: this.props.data === null ? null : tempEndStart,
            weekend_end: this.props.data === null ? null : tempEndEnd,
            inactive: this.props.data === null ? null : this.props.data.deleted,
            tempInactive: this.props.data === null ? null : this.props.data.deleted,
            tempWeekdayStart: this.props.data === null ? null : tempDayStart,
            tempWeekdayEnd: this.props.data === null ? null : tempDayEnd,
            tempWeekendStart: this.props.data === null ? null : tempEndStart,
            tempWeekendEnd: this.props.data === null ? null : tempEndEnd,
            invalidSub: false,
            deleteClick: false,
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
        if(this.dropdownMenu === null){
            {
                this.setState({showDDContent: false}, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick() {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick() {
        //Reset the variables
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempRoomName: this.state.room_name,
            tempWeekdayStart: this.state.weekday_start,
            tempWeekdayEnd: this.state.weekday_end,
            tempWeekendStart: this.state.weekend_start,
            tempWeekendEnd: this.state.weekend_end,
            tempInactive: this.state.inactive,
            deleteClick: false,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }


    handleChange(event) {   //roomID, buildingID, room_name
        return this.setState({[event.target.name]: event.target.value});
    }

    handleWeekdayStart(time){
        this.setState({tempWeekdayStart: time})
    }
    handleWeekdayEnd(time){
        this.setState({tempWeekdayEnd: time})
    }
    handleWeekendStart(time){
        this.setState({tempWeekendStart: time})
    }
    handleWeekendEnd(time){
        this.setState({tempWeekendEnd: time})
    }

    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event){
        event.preventDefault();

        fetch('/deleteRoom', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomID: this.state.roomID,
                inactive: !this.state.inactive
            }),
        })
            .then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.state);

        let input = this.props.add ? '/addRoom' : '/updateRoom';

        fetch(input, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomID: this.state.roomID,
                building: this.state.buildingID,
                room: this.state.tempRoomName,
                wdstart: this.state.tempWeekdayStart,
                wdend: this.state.tempWeekdayEnd,
                westart: this.state.tempWeekendStart,
                weend: this.state.tempWeekendEnd
            }),
        }).then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    render() {
        let formatted;
        if(!this.props.add)
            formatted = {
                dayStart: moment(this.state.weekday_start).format('HH:mm'),
                dayEnd: moment(this.state.weekday_end).format('HH:mm'),
                endStart: moment(this.state.weekend_start).format('HH:mm'),
                endEnd: moment(this.state.weekend_end).format('HH:mm')
            };
        return(
                this.props.add ? (
                    <div className='dd-list-container'>
                        <div className = 'dd-list-header'>
                            <div className = 'event-item'>
                                Add Room
                            </div>
                        </div>
                        {
                            // Edit form for events shown on 'edit' click
                            <div className = 'dd-list-content'>
                            <div className = 'dd-form-content'>
                                <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                    <label className = 'dd-edit-item'>
                                        Building ID:
                                        <input name = 'buildingID' type="number" value={this.state.buildingID} onChange={this.handleChange} />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Room Name:
                                        <input name = 'tempRoomName' type="text" maxLength={45} value={this.state.tempRoomName} onChange={this.handleChange} />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Weekday Start:
                                        <DatePicker
                                            name = 'weekday-start'
                                            selected={this.state.tempWeekdayStart}
                                            onChange={this.handleWeekdayStart}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={30}
                                            dateFormat='HH:mm'
                                            timeCaption="Start"
                                        />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Weekday End:
                                        <DatePicker
                                            name = 'weekday-end'
                                            selected={this.state.tempWeekdayEnd}
                                            onChange={this.handleWeekdayEnd}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={30}
                                            dateFormat='HH:mm'
                                            timeCaption="End"
                                        />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Weekend Start:
                                        <DatePicker
                                            name = 'weekend-start'
                                            selected={this.state.tempWeekendStart}
                                            onChange={this.handleWeekendStart}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={30}
                                            dateFormat='HH:mm'
                                            timeCaption="Start"
                                        />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Weekend End:
                                        <DatePicker
                                            name = 'weekend-end'
                                            selected={this.state.tempWeekendEnd}
                                            onChange={this.handleWeekendEnd}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={30}
                                            dateFormat='HH:mm'
                                            timeCaption="End"
                                        />
                                    </label>
                                    <input type="submit" value="Submit" />
                                </form>
                                {
                                    this.state.invalidSub ? (
                                        <div id = 'invalid-submission-error' style={{'color':'red'}}>
                                            Invalid submission
                                        </div>
                                    ) : null
                                }
                                <br/>
                            </div>
                            </div>
                        }
                    </div>
                ) : (
                    // The shown portion of the individual events
                    <div className='dd-list-container'>
                        <div className = 'dd-list-header' onClick={this.showDDContent}>
                            <div className = 'event-item'>
                                Building: {this.state.building_name}
                            </div>
                            <div className = 'event-item'>
                                Room: {this.state.room_name}
                            </div>
                        </div>
                        {
                            this.state.showDDContent ? (
                                <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>
                                    <div className = 'dd-list-items'>
                                        Building ID: {this.state.buildingID}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        Room ID: {this.state.roomID}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        Weekday Start: {formatted.dayStart}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        Weekday End: {formatted.dayEnd}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        Weekend Start: {formatted.endStart}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        Weekend End: {formatted.endEnd}
                                    </div>
                                    <div className = 'dd-list-items'>
                                        {this.state.inactive ? 'Inactive' : 'Active'}
                                    </div>
                                    {
                                        !this.state.ddEditClick ? (
                                            <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                        ) : (
                                            // Edit form for events shown on 'edit' click
                                            <div className = 'dd-form-content'>
                                                <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                                    <label className = 'dd-edit-item'>
                                                        Room Name:
                                                        <input name = 'tempRoomName' type="text" maxLength={45} value={this.state.tempRoomName} onChange={this.handleChange} />
                                                    </label>
                                                    <label className = 'dd-edit-item'>
                                                         Weekday Start:
                                                        <DatePicker
                                                            name = 'weekday-start'
                                                            selected={this.state.tempWeekdayStart}
                                                            onChange={this.handleWeekdayStart}
                                                            showTimeSelect
                                                            showTimeSelectOnly
                                                            timeIntervals={30}
                                                            dateFormat='HH:mm'
                                                            timeCaption="Start"
                                                        />
                                                    </label>
                                                    <label className = 'dd-edit-item'>
                                                        Weekday End:
                                                        <DatePicker
                                                            name = 'weekday-end'
                                                            selected={this.state.tempWeekdayEnd}
                                                            onChange={this.handleWeekdayEnd}
                                                            showTimeSelect
                                                            showTimeSelectOnly
                                                            timeIntervals={30}
                                                            dateFormat='HH:mm'
                                                            timeCaption="End"
                                                        />
                                                    </label>
                                                    <label className = 'dd-edit-item'>
                                                    Weekend Start:
                                                    <DatePicker
                                                        name = 'weekend-start'
                                                        selected={this.state.tempWeekendStart}
                                                        onChange={this.handleWeekendStart}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={30}
                                                        dateFormat='HH:mm'
                                                        timeCaption="Start"
                                                    />
                                                    </label>
                                                    <label className = 'dd-edit-item'>
                                                    Weekend End:
                                                    <DatePicker
                                                        name = 'weekend-end'
                                                        selected={this.state.tempWeekendEnd}
                                                        onChange={this.handleWeekendEnd}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={30}
                                                        dateFormat='HH:mm'
                                                        timeCaption="End"
                                                    />
                                                    </label>

                                                    <input type="submit" value="Submit" />
                                                    {
                                                        !this.state.deleteClick ? (
                                                            <button onClick={this.handleDeleteClick}>{!this.state.inactive ? 'Remove' : 'Reactivate'}</button>
                                                        ) : (
                                                            <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM</button>
                                                        )
                                                    }
                                                </form>
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
                                    }

                                </div>
                            ) : ( null )
                        }
                    </div>
                )
        );
    }
}

class UserDropdown extends Component {
    constructor(props) {
        super(props);

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);

        this.state = {
            userID: this.props.data === null ? null : this.props.data.userID,
            netID: this.props.data === null ? '' : this.props.data.netID,
            tempNetID: this.props.data === null ? '' : this.props.data.netID,
            firstName: this.props.data === null ? '' : this.props.data.first_name,
            tempFirst: this.props.data === null ? '' : this.props.data.first_name,
            lastName: this.props.data === null ? '' : this.props.data.last_name,
            tempLast: this.props.data === null ? '' : this.props.data.last_name,
            email: this.props.data === null ? '' : this.props.data.email,
            tempEmail: this.props.data === null ? '' : this.props.data.email,
            course:this.props.data === null ? '' : this.props.data.course,
            tempCourse: this.props.data === null ? '' : this.props.data.course,
            teamNumber: this.props.data === null ? null : this.props.data.team_num,
            tempTeam: this.props.data === null ? null : this.props.data.team_num,
            inactive: this.props.data === null ? null : this.props.data.deleted,
            tempInactive: this.props.data === null ? null : this.props.data.deleted,
            invalidSub: false,
            deleteClick: false,
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
        if(this.dropdownMenu === null){
            {
                this.setState({showDDContent: false}, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick() {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick() {
        //Reset the variables
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempNetID: this.state.netID,
            tempFirst: this.state.firstName,
            tempLast: this.state.lastName,
            tempEmail: this.state.email,
            tempCourse: this.state.course,
            tempTeam: this.state.teamNumber,
            tempInactive: this.state.inactive,
            deleteClick: false,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }


    handleChange(event) {   //roomID, buildingID, room_name
        return this.setState({[event.target.name]: event.target.value});
    }

    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event){
        event.preventDefault();

        fetch('/deleteUser', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: this.state.userID,
                inactive: !this.state.inactive
            }),
        })
            .then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.state);

        let input = this.props.add ? '/addUser' : '/updateUser';

        fetch(input, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: this.state.userID,
                netID: this.state.tempNetID,
                firstName: this.state.tempFirst,
                lastName: this.state.tempLast,
                email: this.state.tempEmail,
                course: this.state.tempCourse,
                teamNumber: this.state.tempTeam
            }),
        }).then(response => response.text())
            .then(result => {
                console.log(result);
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    render() {
        return(
            this.props.data === null ? (
                <div className='dd-list-container'>
                    <div className = 'dd-list-header'>
                        Add User
                    </div>
                    {
                        <div className = 'dd-list-content'>
                            {
                                // Edit form for events
                                <div className = 'dd-form-content'>
                                    <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                        <label className = 'dd-edit-item'>
                                            Net ID:
                                            <input name = 'tempNetID' type="text" maxLength={45} value={this.state.tempNetID} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            First Name:
                                            <input name = 'tempFirst' type="text" maxLength={45} value={this.state.tempFirst} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            Last Name:
                                            <input name = 'tempLast' type="text" maxLength={45} value={this.state.tempLast} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            Email:
                                            <input name = 'tempEmail' type="text" maxLength={45} value={this.state.tempEmail} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            Course:
                                            <input name = 'tempCourse' type="text" maxLength={45} value={this.state.tempCourse} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            Project Number:
                                            <input name = 'tempTeam' type="text" maxLength={45} value={this.state.tempTeam} onChange={this.handleChange} />
                                        </label>

                                        <input type="submit" value="Submit" />
                                    </form>
                                    {
                                        this.state.invalidSub ? (
                                            <div id = 'invalid-submission-error' style={{'color':'red'}}>
                                                Invalid submission
                                            </div>
                                        ) : null
                                    }
                                    <br/>
                                </div>
                            }

                        </div>
                    }
                </div>
            ) : (
            // The shown portion of the individual events
            <div className='dd-list-container'>
                <div className = 'dd-list-header' onClick={this.showDDContent}>
                    <div className = 'event-item'>
                        User ID: {this.state.userID}
                    </div>
                    <div className = 'event-item'>
                        First Name: {this.state.firstName}
                    </div>
                    <div className = 'event-item'>
                        Last Name: {this.state.lastName}
                    </div>
                    <div className = 'event-item'>
                        Project Number: {this.state.teamNumber}
                    </div>
                </div>
                {
                    this.state.showDDContent ? (
                        <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>
                            <div className = 'dd-list-items'>
                                Net ID: {this.state.netID}
                            </div>
                            <div className = 'dd-list-items'>
                                Email: {this.state.email}
                            </div>
                            <div className = 'dd-list-items'>
                                Course: {this.state.course}
                            </div>

                            <div className = 'dd-list-items'>
                                {this.state.inactive ? 'Inactive' : 'Active'}
                            </div>
                            {
                                !this.state.ddEditClick ? (
                                    <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                ) : (
                                    // Edit form for events shown on 'edit' click
                                    <div className = 'dd-form-content'>
                                        <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                            <label className = 'dd-edit-item'>
                                                Net ID:
                                                <input name = 'tempNetID' type="text" maxLength={45} value={this.state.tempNetID} onChange={this.handleChange} />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                First Name:
                                                <input name = 'tempFirst' type="text" maxLength={45} value={this.state.tempFirst} onChange={this.handleChange} />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                Last Name:
                                                <input name = 'tempLast' type="text" maxLength={45} value={this.state.tempLast} onChange={this.handleChange} />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                Email:
                                                <input name = 'tempEmail' type="text" maxLength={45} value={this.state.tempEmail} onChange={this.handleChange} />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                Course:
                                                <input name = 'tempCourse' type="text" maxLength={45} value={this.state.tempCourse} onChange={this.handleChange} />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                Project Number:
                                                <input name = 'tempTeam' type="text" maxLength={45} value={this.state.tempTeam} onChange={this.handleChange} />
                                            </label>

                                            <input type="submit" value="Submit" />
                                            {
                                                !this.state.deleteClick ? (
                                                    <button onClick={this.handleDeleteClick}>{!this.state.inactive ? 'Remove' : 'Reactivate'}</button>
                                                ) : (
                                                    <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM</button>
                                                )
                                            }
                                        </form>
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
                            }

                        </div>
                    ) : ( null )
                }
            </div>
            )
        );
    }
}

class BuildingDropdown extends Component {
    constructor(props) {
        super(props);

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
        this.handleSemesterStart = this.handleSemesterStart.bind(this);
        this.handleSemesterEnd  = this.handleSemesterEnd.bind(this);

        this.state = {
            buildingID: this.props.data === null ? null : this.props.data.buildingID,
            buildingName: this.props.data === null ? null : this.props.data.building_name,
            tempBuildingName: this.props.data === null ? null : this.props.data.building_name,
            semesterStart: this.props.data === null ? null : new Date(Date.parse(this.props.data.semester_start)),
            tempSemesterStart: this.props.data === null ? null : new Date(Date.parse(this.props.data.semester_start)),
            semesterEnd: this.props.data === null ? null : new Date(Date.parse(this.props.data.semester_end)),
            tempSemesterEnd: this.props.data === null ? null : new Date(Date.parse(this.props.data.semester_end)),
            dailyLimit: this.props.data === null ? null : this.props.data.daily_limit,
            tempDailyLimit: this.props.data === null ? null : this.props.data.daily_limit,
            weeklyLimit: this.props.data === null ? null : this.props.data.weekly_limit,
            tempWeeklyLimit: this.props.data === null ? null : this.props.data.weekly_limit,
            inactive: this.props.data === null ? null : this.props.data.deleted,
            tempInactive: this.props.data === null ? null : this.props.data.deleted,
            invalidSub: false,
            deleteClick: false,
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
        if(this.dropdownMenu === null){
            {
                this.setState({showDDContent: false}, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick() {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick() {
        //Reset the variables
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempBuildingName: this.state.buildingName,
            tempSemesterStart: this.state.semesterStart,
            tempSemesterEnd: this.state.semesterEnd,
            tempDailyLimit: this.state.dailyLimit,
            tempWeeklyLimit: this.state.weeklyLimit,
            tempInactive: this.state.inactive,
            deleteClick: false,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }


    handleChange(event) {   //roomID, buildingID, room_name
        return this.setState({[event.target.name]: event.target.value});
    }

    handleSemesterStart(date){
        this.setState({tempSemesterStart: date})
    }
    handleSemesterEnd(date){
        this.setState({tempSemesterEnd: date})
    }

    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event){
        event.preventDefault();

        fetch('/deleteBuilding', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                buildingID: this.state.buildingID,
                inactive: !this.state.inactive
            }),
        })
            .then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.state);

        let input = this.props.add ? '/addBuilding' : '/updateBuilding';

        fetch(input, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                buildingID: this.state.buildingID,
                semesterStart: this.state.tempSemesterStart,
                semesterEnd: this.state.tempSemesterEnd,
                buildingName: this.state.tempBuildingName,
                dailyLimit: this.state.tempDailyLimit,
                weeklyLimit: this.state.tempWeeklyLimit
            }),
        }).then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    render() {
        let start = moment(this.state.semesterStart).format('MMMM DD, YYYY');
        let end = moment(this.state.semesterEnd).format('MMMM DD, YYYY');
        return(
            this.props.data === null ? (
                // The shown portion of the individual events
                <div className='dd-list-container'>
                    <div className = 'dd-list-header'>
                        Add Building
                    </div>
                    {
                        <div className = 'dd-list-content'>
                            <div className = 'dd-form-content'>
                                <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                    <label className = 'dd-edit-item'>
                                        Building Name:
                                        <input name = 'tempBuildingName' type="text" maxLength={45} value={this.state.tempBuildingName} onChange={this.handleChange} />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Semester Start:
                                        <DatePicker
                                            name = 'semester-start'
                                            selected={this.state.tempSemesterStart}
                                            onChange={this.handleSemesterStart}
                                            dateFormat='MMMM d, yyyy'
                                            timeCaption="Start"
                                        />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Semester End:
                                        <DatePicker
                                            name = 'semester-end'
                                            selected={this.state.tempSemesterEnd}
                                            onChange={this.handleSemesterEnd}
                                            dateFormat='MMMM d, yyyy'
                                            timeCaption="End"
                                        />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Daily Limit:
                                        <input name = 'tempDailyLimit' type="number" min={0} max={24} value={this.state.tempDailyLimit} onChange={this.handleChange} />
                                    </label>
                                    <label className = 'dd-edit-item'>
                                        Weekly Limit:
                                        <input name = 'tempWeeklyLimit' type="number" min={0} max={168} value={this.state.tempWeeklyLimit} onChange={this.handleChange} />
                                    </label>

                                    <input type="submit" value="Submit" />
                                </form>
                                {
                                    this.state.invalidSub ? (
                                        <div id = 'invalid-submission-error' style={{'color':'red'}}>
                                            Invalid submission
                                        </div>
                                    ) : null
                                }
                                <br/>
                                </div>
                        </div>
                    }
                </div>
            ) : (
                // The shown portion of the individual events
                <div className='dd-list-container'>
                    <div className = 'dd-list-header' onClick={this.showDDContent}>
                        <div className = 'event-item'>
                            Building ID: {this.state.buildingID}
                        </div>
                        <div className = 'event-item'>
                            Building Name: {this.state.buildingName}
                        </div>
                    </div>
                    {
                        this.state.showDDContent ? (
                            <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>
                                <div className = 'dd-list-items'>
                                    Semester Start: {start}
                                </div>
                                <div className = 'dd-list-items'>
                                    Semester End: {end}
                                </div>
                                <div className = 'dd-list-items'>
                                    Daily Limit: {this.state.dailyLimit}
                                </div>
                                <div className = 'dd-list-items'>
                                    Weekly Limit: {this.state.weeklyLimit}
                                </div>

                                <div className = 'dd-list-items'>
                                    {this.state.inactive ? 'Inactive' : 'Active'}
                                </div>
                                {
                                    !this.state.ddEditClick ? (
                                        <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                    ) : (
                                        // Edit form for events shown on 'edit' click
                                        <div className = 'dd-form-content'>
                                            <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                                <label className = 'dd-edit-item'>
                                                    Building Name:
                                                    <input name = 'tempBuildingName' type="text" maxLength={45} value={this.state.tempBuildingName} onChange={this.handleChange} />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    Semester Start:
                                                    <DatePicker
                                                        name = 'semester-start'
                                                        selected={this.state.tempSemesterStart}
                                                        onChange={this.handleSemesterStart}
                                                        dateFormat='MMMM d, yyyy'
                                                        timeCaption="Start"
                                                    />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    Semester End:
                                                    <DatePicker
                                                        name = 'semester-end'
                                                        selected={this.state.tempSemesterEnd}
                                                        onChange={this.handleSemesterEnd}
                                                        dateFormat='MMMM d, yyyy'
                                                        timeCaption="End"
                                                    />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    Daily Limit:
                                                    <input name = 'tempDailyLimit' type="number" min={0} max={24} value={this.state.tempDailyLimit} onChange={this.handleChange} />
                                                </label>
                                                <label className = 'dd-edit-item'>
                                                    Weekly Limit:
                                                    <input name = 'tempWeeklyLimit' type="number" min={0} max={168} value={this.state.tempWeeklyLimit} onChange={this.handleChange} />
                                                </label>

                                                <input type="submit" value="Submit" />
                                                {
                                                    !this.state.deleteClick ? (
                                                        <button onClick={this.handleDeleteClick}>{!this.state.inactive ? 'Remove' : 'Reactivate'}</button>
                                                    ) : (
                                                        <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM</button>
                                                    )
                                                }
                                            </form>
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
                                }

                            </div>
                        ) : ( null )
                    }

                </div>
            )
        );
    }
}

class UserClassDropdown extends Component {
    constructor(props) {
        super(props);

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);

        this.state = {
            classID: this.props.data === null ? null : this.props.data.classID,
            tempClassID: this.props.data === null ? null : this.props.data.classID,
            userID: this.props.data === null ? null : this.props.data.userID,
            inactive: this.props.data === null ? null : this.props.data.deleted,
            tempInactive: this.props.data === null ? null : this.props.data.deleted,
            invalidSub: false,
            deleteClick: false,
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
        if(this.dropdownMenu === null){
            {
                this.setState({showDDContent: false}, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick() {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick() {
        //Reset the variables
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempClassID: this.state.classID,
            tempInactive: this.state.inactive,
            deleteClick: false,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }


    handleChange(event) {   //roomID, buildingID, room_name
        return this.setState({[event.target.name]: event.target.value});
    }

    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event){
        event.preventDefault();

        fetch('/deleteUserClass', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classID: this.state.classID,
                userID: this.state.userID,
                inactive: !this.state.inactive
            }),
        })
            .then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.state);

        let input = this.props.add ? '/addUserClass' : '/updateUserClass';

        fetch(input, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oldclassID: this.state.classID,
                newclassID: this.state.tempClassID,
                userID: this.state.userID
            }),
        }).then(response => response.text())
            .then(result => {
                console.log(result);
                if(result === "Error")
                    alert("Invalid Submission");
               // else
                    //window.location.reload();
            });
    }

    render() {
        return(
            this.props.data === null ? (
                // The shown portion of the individual events
                <div className='dd-list-container'>
                    <div className = 'dd-list-header'>
                        Add User Classification
                    </div>
                    {
                        <div className = 'dd-list-content' >
                            {
                                // Edit form for events shown on 'edit' click
                                <div className = 'dd-form-content'>
                                    <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                        <label className = 'dd-edit-item'>
                                            User ID:
                                            <input name = 'userID' type="number" min={1} value={this.state.userID} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            Class ID:
                                            <input name = 'tempClassID' type="number" min={1} value={this.state.tempClassID} onChange={this.handleChange} />
                                        </label>

                                        <input type="submit" value="Submit" />
                                    </form>
                                    {
                                        this.state.invalidSub ? (
                                            <div id = 'invalid-submission-error' style={{'color':'red'}}>
                                                Invalid submission
                                            </div>
                                        ) : null
                                    }
                                </div>
                            }

                        </div>
                    }
                </div>
            ) : (
                // The shown portion of the individual events
                <div className='dd-list-container'>
                    <div className = 'dd-list-header' onClick={this.showDDContent}>
                        <div className = 'event-item'>
                            User ID: {this.state.userID}
                        </div>
                        <div className = 'event-item'>
                            Class ID: {this.state.classID}
                        </div>
                    </div>
                    {
                        this.state.showDDContent ? (
                            <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>
                                <div className = 'dd-list-items'>
                                    {this.state.inactive ? 'Inactive' : 'Active'}
                                </div>
                                {
                                    !this.state.ddEditClick ? (
                                        <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                    ) : (
                                        // Edit form for events shown on 'edit' click
                                        <div className = 'dd-form-content'>
                                            <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                                <label className = 'dd-edit-item'>
                                                    Class ID:
                                                    <input name = 'tempClassID' type="number" min={1} value={this.state.tempClassID} onChange={this.handleChange} />
                                                </label>

                                                <input type="submit" value="Submit" />
                                                {
                                                    !this.state.deleteClick ? (
                                                        <button onClick={this.handleDeleteClick}>{!this.state.inactive ? 'Remove' : 'Reactivate'}</button>
                                                    ) : (
                                                        <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM</button>
                                                    )
                                                }
                                            </form>
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
                                }

                            </div>
                        ) : ( null )
                    }
                </div>
            )
        );
    }
}

class ClassDropdown extends Component {
    constructor(props) {
        super(props);

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);

        this.state = {
            classID: this.props.data === null ? null : this.props.data.classID,
            classDetail: this.props.data === null ? null : this.props.data.class_detail,
            tempClassDetail: this.props.data === null ? null : this.props.data.class_detail,
            inactive: this.props.data === null ? null : this.props.data.deleted,
            tempInactive: this.props.data === null ? null : this.props.data.deleted,
            invalidSub: false,
            deleteClick: false,
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
        if(this.dropdownMenu === null){
            {
                this.setState({showDDContent: false}, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick() {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick() {
        //Reset the variables
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempClassID: this.state.classID,
            tempInactive: this.state.inactive,
            deleteClick: false,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }


    handleChange(event) {   //roomID, buildingID, room_name
        return this.setState({[event.target.name]: event.target.value});
    }

    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event){
        event.preventDefault();

        fetch('/deleteClass', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classID: this.state.classID,
                inactive: !this.state.inactive
            }),
        })
            .then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.state);

        let input = this.props.add ? '/addClass' : '/updateClass';

        fetch(input, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classID: this.state.classID,
                detail: this.state.tempClassDetail
            }),
        }).then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    render() {
        return(
            this.props.data === null ? (
                // The shown portion of the individual events
                <div className='dd-list-container'>
                    <div className = 'dd-list-header'>
                        Classifications
                    </div>
                    {
                        <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>
                            {
                                // Edit form for events shown on 'edit' click
                                <div className = 'dd-form-content'>
                                    <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                        <label className = 'dd-edit-item'>
                                            Class Detail:
                                            <input name = 'tempClassDetail' type="text" max={45} value={this.state.tempClassDetail} onChange={this.handleChange} />
                                        </label>

                                        <input type="submit" value="Submit" />
                                    </form>
                                    {
                                        this.state.invalidSub ? (
                                            <div id = 'invalid-submission-error' style={{'color':'red'}}>
                                                Invalid submission
                                            </div>
                                        ) : null
                                    }
                                </div>
                            }
                        </div>
                    }
                </div>
            ) : (
                // The shown portion of the individual events
                <div className='dd-list-container'>
                    <div className = 'dd-list-header' onClick={this.showDDContent}>
                        <div className = 'event-item'>
                            Class ID: {this.state.classID}
                        </div>
                    </div>
                    {
                        this.state.showDDContent ? (
                            <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>
                                <div className = 'dd-list-items'>
                                    Class Details: {this.state.classDetail}
                                </div>
                                <div className = 'dd-list-items'>
                                    {this.state.inactive ? 'Inactive' : 'Active'}
                                </div>
                                {
                                    !this.state.ddEditClick ? (
                                        <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                    ) : (
                                        // Edit form for events shown on 'edit' click
                                        <div className = 'dd-form-content'>
                                            <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                                <label className = 'dd-edit-item'>
                                                    Class Detail:
                                                    <input name = 'tempClassDetail' type="text" max={45} value={this.state.tempClassDetail} onChange={this.handleChange} />
                                                </label>

                                                <input type="submit" value="Submit" />
                                                {
                                                    !this.state.deleteClick ? (
                                                        <button onClick={this.handleDeleteClick}>{!this.state.inactive ? 'Remove' : 'Reactivate'}</button>
                                                    ) : (
                                                        <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM</button>
                                                    )
                                                }
                                            </form>
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
                                }

                            </div>
                        ) : ( null )
                    }
                </div>
            )
        );
    }
}

class RoomClassDropdown extends Component {
    constructor(props) {
        super(props);

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);

        this.state = {
            classID: this.props.data === null ? null : this.props.data.classID,
            tempClassID: this.props.data === null ? null : this.props.data.classID,
            roomID: this.props.data === null ? null : this.props.data.roomID,
            inactive: this.props.data === null ? null : this.props.data.deleted,
            tempInactive: this.props.data === null ? null : this.props.data.deleted,
            invalidSub: false,
            deleteClick: false,
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
        if(this.dropdownMenu === null){
            {
                this.setState({showDDContent: false}, () => {
                    document.removeEventListener('click', this.closeDDContent);
                });
            }
        }
        else if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick() {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick() {
        //Reset the variables
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempClassID: this.state.classID,
            tempInactive: this.state.inactive,
            deleteClick: false,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }


    handleChange(event) {   //roomID, buildingID, room_name
        return this.setState({[event.target.name]: event.target.value});
    }

    handleDeleteClick(event) {
        event.preventDefault();
        this.setState({deleteClick: true});
    }

    handleDeleteConfirm(event){
        event.preventDefault();

        fetch('/deleteRoomClass', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomID: this.state.roomID,
                classID: this.state.classID,
                inactive: !this.state.inactive
            }),
        })
            .then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.state);

        let input = this.props.add ? '/addRoomClass' : '/updateRoomClass';

        fetch(input, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomID: this.state.roomID,
                oldclassID: this.state.classID,
                newclassID: this.state.tempClassID,
                buildingID: this.state.buildingID
            }),
        }).then(response => response.text())
            .then(result => {
                if(result === "Error")
                    alert("Invalid Submission");
                else
                    window.location.reload();
            });
    }

    render() {
        return(
            this.props.data === null ? (
                // The shown portion of the individual events
                <div className='dd-list-container'>
                    <div className = 'dd-list-header'>
                        Add Room Classification
                    </div>
                    {
                        <div className = 'dd-list-content'>
                            {
                                // Edit form for events shown on 'edit' click
                                <div className = 'dd-form-content'>
                                    <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                        <label className = 'dd-edit-item'>
                                            Room ID:
                                            <input name = 'roomID' type="number" min={1} value={this.state.roomID} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            Class ID:
                                            <input name = 'tempClassID' type="number" min={1} value={this.state.tempClassID} onChange={this.handleChange} />
                                        </label>
                                        <label className = 'dd-edit-item'>
                                            Building ID:
                                            <input name = 'buildingID' type="number" min={1} value={this.state.buildingID} onChange={this.handleChange} />
                                        </label>

                                        <input type="submit" value="Submit" />
                                    </form>
                                    {
                                        this.state.invalidSub ? (
                                            <div id = 'invalid-submission-error' style={{'color':'red'}}>
                                                Invalid submission
                                            </div>
                                        ) : null
                                    }
                                </div>
                            }
                        </div>
                    }
                </div>
            ) : (
                    // The shown portion of the individual events
                    <div className='dd-list-container'>
                        <div className = 'dd-list-header' onClick={this.showDDContent}>
                            <div className = 'event-item'>
                                Room ID: {this.state.roomID}
                            </div>
                            <div className = 'event-item'>
                                Class ID: {this.state.classID}
                            </div>
                        </div>
                        {
                            this.state.showDDContent ? (
                                <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>
                                    <div className = 'dd-list-items'>
                                        {this.state.inactive ? 'Inactive' : 'Active'}
                                    </div>
                                    {
                                        !this.state.ddEditClick ? (
                                            <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                        ) : (
                                            // Edit form for events shown on 'edit' click
                                            <div className = 'dd-form-content'>
                                                <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                                    <label className = 'dd-edit-item'>
                                                        Class ID:
                                                        <input name = 'tempClassID' type="number" min={1} value={this.state.tempClassID} onChange={this.handleChange} />
                                                    </label>

                                                    <input type="submit" value="Submit" />
                                                    {
                                                        !this.state.deleteClick ? (
                                                            <button onClick={this.handleDeleteClick}>{!this.state.inactive ? 'Remove' : 'Reactivate'}</button>
                                                        ) : (
                                                            <button onClick={this.handleDeleteConfirm} style={{'color':'white', 'background':'red'}}>CONFIRM</button>
                                                        )
                                                    }
                                                </form>
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
                                    }

                                </div>
                            ) : ( null )
                        }
                    </div>
            )
        );
    }
}

export default Admin;