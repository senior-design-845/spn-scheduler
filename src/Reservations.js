import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./Reservations.css";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import NumericInput from 'react-numeric-input';
import Modal from 'react-modal'
import moment from 'moment'

const customStyles = {
    overlay: {
        backgroundColor: 'papayawhip'
    },
    content: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        right: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'scroll'
    }
};
Modal.setAppElement(document.getElementById('root'));

class Reservations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showRoomMenu: false,    //Toggles drop down
            showStartDate: false,   //Toggles start date calendar
            showStartTime: false,   //Toggles start time menu
            showEndTime: false,     //Toggles end time menu
            showSubmit: false,      //Toggles submit reservation button
            showRecurring: false,
            showEndDate: false,
            showCustom: false,
            showVerify: [false, false, false, false, false, false, false, false, false],
            showGetRooms: false,
            showAvailableOptions: false,
            startDate: null,        //Selected start date
            endDate: null,
            startTime: null,        //Selected start time
            endTime: null,          //Selected end time
            selectedRoom: 'Select Room',
            selectedRecurring: 'Does not repeat',
            customOption: '',
            dailyHoursLeft: 0,           //Hours of reservation time left for the user pulled from db
            weeklyHoursLeft: 0,
            semesterStart: null,
            semesterEnd: null,
            dayStart: null,         //Room open time pulled from db
            dayEnd: null,           //Room close time pulled from db
            maxStartTime: null,     //30 minutes before dayEnd
            minStartTime: null,     //30 minutes after chosen StartTime
            maxEndTime: null,        //Min of dayEnd and ( chosen StartTime + hoursLeft)
            recurringNumber: 1,
            weekdays: [false, false, false, false, false, false, false],
            weekInMonth: 0,
            modalIsOpen: false,
            verificationResults: [],
            availableRoomOptions: [],
            validReservations: []
        };

        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.handleRooms = this.handleRooms.bind(this);
        this.handleRecurring = this.handleRecurring.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.handleNumber = this.handleNumber.bind(this);
        this.handleCustom = this.handleCustom.bind(this);
        this.handleMultipleDays = this.handleMultipleDays.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAvailable = this.handleAvailable.bind(this);
        this.handleGetRooms = this.handleGetRooms.bind(this);
    }

    componentDidMount() {
        if (this.props.userInfo.classID !== 1) {
            //Get the semester start and end dates
            fetch('/semester', {
                method: 'post',
                headers: {
                    'Accept': "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    building: this.props.userInfo.buildingID
                })
            }).then(response => {
                try {
                    return response.json()
                }
                catch{
                    alert("Invalid Server Response")
                }
            })
                .then(semester => {
                    try {
                        this.setState({
                            semesterStart: new Date(semester.semester_start),
                            semesterEnd: new Date(semester.semester_end)
                        })
                    }
                    catch{
                        alert("Invalid Server Response")
                    }
                })
        }
    }

    handleRooms(selected) {
        //Room has been selected
        let tempVerify = this.state.showVerify;
        tempVerify[0] = true;       //Room is selected
        tempVerify[4] = true;       //Don't need available room options
        tempVerify[5] = true;       //Don't need available room options

        if (selected.value === 'Any Available Room') {        //Do not need to choose a recurring option for any available room
            let days = [false, false, false, false, false, false, false];
            if (this.state.startDate !== null) {
                //Sets the weekday value
                days[this.state.startDate.getDay()] = true;
            }
            //Will need to select from available rooms
            tempVerify[8] = false;

            this.setState({
                selectedRoom: selected.value,
                showStartDate: true,
                showVerify: tempVerify,
                showRecurring: false,
                selectedRecurring: 'Does not repeat',
                showEndDate: false,
                showCustom: false,
                endDate: null,
                dayStart: null,
                dayEnd: null,
                maxStartTime: null,
                maxEndTime: new Date(new Date().setHours(23, 59)),
                customOption: 'Days',
                recurringNumber: 1,
                weekdays: days,
                showGetRooms: true,
                showAvailableOptions: false
            });
        }
        else {
            //Available rooms option was selected
            let recurring = this.state.showRecurring;
            if (this.state.startDate !== null)       //Handles changing from AAR to an actual room and already having chosen start date
                recurring = true;

            tempVerify[1] = false;
            tempVerify[2] = false;
            tempVerify[3] = false;
            tempVerify[8] = true;

            this.setState({
                selectedRoom: selected.value,
                showStartDate: true,
                showVerify: tempVerify,
                showRecurring: recurring,
                showGetRooms: false,
                startDate: null,
                startTime: null,
                endTime: null,
                showStartTime: false,
                showEndTime: false
            })
        }
    }

    handleStartDateChange(date) {
        let tempDate = new Date(date);

        //Gets the week number of the month of the selected date
        let month = tempDate.getMonth();
        let count = 0;
        while (tempDate.getMonth() === month) {
            tempDate.setDate(tempDate.getDate() - 7);
            count++;
        }

        //Start date has been selected but start and end times need to be reselected
        let tempVerify = this.state.showVerify;
        tempVerify[1] = true;
        tempVerify[2] = false;
        tempVerify[3] = false;

        //Sets the weekday value
        let days = [false, false, false, false, false, false, false];
        days[date.getDay()] = true;

        fetch('/hours', {
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.props.userInfo.userID,
                room: this.state.selectedRoom,
                building: this.props.userInfo.buildingID,
                startDate: date
            })
        }).then(response => {
            try {
                return response.json()
            }
            catch{
                alert("Invalid Server Response")
            }
        })
            .then(hours => {
                try {
                    let tempDate = null, tempDate2 = null;
                    if (hours.dayStart !== null && hours.dayEnd !== null) {
                        //Getting the date variables for the dayStart and dayEnd state values
                        let tempTime = String(hours.dayStart).split(/[:]/);
                        tempDate = new Date();
                        tempDate.setMinutes(parseInt(tempTime[1], 10));
                        tempDate.setHours(parseInt(tempTime[0], 10));
                        tempDate2 = new Date();
                        tempTime = String(hours.dayEnd).split(/[:]/);
                        tempDate2.setMinutes(parseInt(tempTime[1], 10));
                        tempDate2.setHours(parseInt(tempTime[0], 10));
                    }


                    this.setState({
                        dailyHoursLeft: hours.dailyHours,
                        weeklyHoursLeft: hours.weeklyHours,
                        maxStartTime: tempDate2 === null ? null : new Date(new Date(tempDate2).setMinutes(tempDate2.getMinutes() - 30)),
                        startDate: date,
                        dayStart: tempDate,
                        dayEnd: tempDate2,
                        showStartTime: true,
                        showEndTime: false,
                        showRecurring: this.state.selectedRoom !== "Any Available Room",
                        endDate: this.state.endDate <= date ? null : this.state.endDate,
                        startTime: null,
                        endTime: null,
                        weekInMonth: count,
                        showVerify: tempVerify,
                        weekdays: days,
                        showGetRooms: this.state.selectedRoom === "Any Available Room",
                        showAvailableOptions: false
                    })
                }
                catch{
                    alert("Invalid Server Response")
                }
            });
    }

    handleStartTimeChange(date) {
        //Restricts endTime based on user hours-> Math.min(this.state.dayEnd, new Date(date).setMinutes(date.getMinutes() + Math.min(this.state.dailyHoursLeft, this.state.weeklyHoursLeft)*60))

        //Start time has been selected, end time needs to be chosen if empty or re-chosen if time is before new start time
        let tempVerify = this.state.showVerify;
        tempVerify[2] = true;
        if (this.state.endTime <= date)
            tempVerify[3] = false;

        //If endtime is before the new starttime then reset it
        let end = null;
        if (this.state.endTime !== null)
            end = this.state.endTime.getTime() <= date.getTime() ? null : this.state.endTime;
        //If their is a specified endtime then restrict the options by that, if none is enforced then go until the end of the day
        let endtime = this.state.dayEnd;
        if (endtime === null) {
            endtime = new Date();
            endtime.setHours(23, 59);
        }

        this.setState({
            startTime: date,
            minStartTime: new Date(new Date(date).setMinutes(date.getMinutes() + 30)),
            maxEndTime: endtime,
            showEndTime: true,
            endTime: end,
            showVerify: tempVerify,
            showGetRooms: this.state.selectedRoom === "Any Available Room",
            showAvailableOptions: false
        });

    }
    handleEndTimeChange(date) {
        //End time has been selected
        let tempVerify = this.state.showVerify;
        tempVerify[3] = true;
        this.setState({
            endTime: date,
            showVerify: tempVerify,
            showGetRooms: this.state.selectedRoom === "Any Available Room",
            showAvailableOptions: false
        });
    }

    handleRecurring(selected) {
        //Removes the unique day/week text so that string.include() can be called less in other functions
        let choice = selected.value;
        if (choice.includes('Weekly'))
            choice = 'Weekly';
        else if (choice.includes('Monthly'))
            choice = 'Monthly';

        //Recurring has been selected, if it is not 'Does not repeat' then an end date needs to be chosen
        let tempVerify = this.state.showVerify;
        tempVerify[4] = true;
        tempVerify[5] = selected.value === 'Does not repeat';

        //Sets the weekday value
        let days = [false, false, false, false, false, false, false];
        days[this.state.startDate.getDay()] = true;

        this.setState({
            showEndDate: selected.value !== 'Does not repeat',
            showCustom: selected.value === 'Custom',
            selectedRecurring: choice,
            endDate: null,
            customOption: selected.value === 'Custom' ? 'Days' : '',
            recurringNumber: 1,
            showVerify: tempVerify,
            weekdays: days,
            showGetRooms: this.state.selectedRoom === "Any Available Room"
        })
    }

    handleEndDateChange(date) {
        //Recurring has been selected, if it is not 'Does not repeat' then an end date needs to be chosen
        let tempVerify = this.state.showVerify;
        tempVerify[5] = true;
        this.setState({ endDate: date, showVerify: tempVerify })
    }

    handleNumber(number) {
        this.setState({ recurringNumber: number })
    }

    handleCustom(selected) {
        let weekdays = [false, false, false, false, false, false, false];
        if (selected.value === 'Weeks')
            weekdays[this.state.startDate.getDay()] = true;
        this.setState({ customOption: selected.value, weekdays: weekdays })
    }

    handleMultipleDays() {
        //Sets the correct flags depending on which days of the week were chosen by the user for custom weekly recurring
        let w = this.state.weekdays;
        let none = true;
        for (let k = 0; k < 7; k++)
            if (w[k])
                none = false;
        if (none)
            w[this.state.startDate.getDay()] = true;
        this.setState({ weekdays: w })
    }

    handleVerify(uniqueRooms) {
        //Get room integer
        let roomID = -1;
        uniqueRooms.map(e => {
            if (e.title === this.state.selectedRoom)
                roomID = e.id;
        });

        //
        let resDates = [];
        if (this.state.selectedRecurring === 'Does not repeat') {
            resDates = [this.state.startDate];
        } else {
            let tempDate = new Date(this.state.startDate);

            if (this.state.selectedRecurring === 'Daily' || this.state.customOption === 'Days') {
                while (tempDate <= this.state.endDate) {
                    //Add a single date to the start reservation date until the date is beyond the given end date
                    resDates.push(new Date(tempDate));
                    tempDate.setDate(tempDate.getDate() + this.state.recurringNumber)
                }
            } else if (this.state.selectedRecurring === 'Weekly' || this.state.customOption === 'Weeks') {
                while (tempDate <= this.state.endDate) {
                    //Based on the selected or default weekdays, add each of those dates to the start date then add a week and repeat until the end date is reached
                    let dayofweek = this.state.startDate.getDay();
                    for (let i = 0; i < 7; i++) {
                        if (this.state.weekdays[i]) {
                            let check = new Date(new Date(tempDate).setDate(tempDate.getDate() + (i - dayofweek)));
                            if (check <= this.state.endDate && check >= this.state.startDate)
                                resDates.push(check);
                        }
                    }
                    tempDate.setDate(tempDate.getDate() + (7 * this.state.recurringNumber));
                }
            } else if (this.state.selectedRecurring === 'Monthly' || this.state.customOption === 'Months') {
                let month = this.state.startDate.getMonth();
                while (tempDate <= this.state.endDate) {
                    //Add weeks until into the next month, then add the set number of weeks
                    resDates.push(new Date(tempDate));
                    while (tempDate.getMonth() === month) {
                        tempDate.setDate(tempDate.getDate() + 7);
                    }
                    let addNum = this.state.weekInMonth - (this.state.weekInMonth === 5 ? 2 : 1);
                    tempDate.setDate(tempDate.getDate() + (7 * (addNum)));
                    month = month === 12 ? 1 : month + 1;
                }
            }
        }

        fetch('/verifyReservations', {
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.props.userInfo.userID,
                building: this.props.userInfo.buildingID,
                title: this.state.tempTitle,
                description: this.state.tempDescription,
                reservations: resDates,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                roomID: roomID
            })
        }).then(response => {
            try {
                return response.json()
            }
            catch{
                alert("Invalid Server Response")
            }
        })
            .then(valid => {
                try {
                    let check = false;
                    let newReservations = [];
                    let string;
                    let allstrings = [];
                    valid.map(v => {
                        string = v.start + ' to ' + v.end;
                        //If there is a conflict or a student is over in weekly/daily hours
                        if (v.valid.conflict === 1 || (v.valid.dailyOver === 1 && (this.props.userInfo.classID !== 1 && this.props.userInfo.classID !== 3)) || (v.valid.weeklyOver === 1 && (this.props.userInfo.classID !== 1 && this.props.userInfo.classID !== 3))) {
                            string += ' -> Unavailable';
                            if (v.valid.conflict === 1) {
                                string += ' -> Schedule conflict';
                            }
                            if ((v.valid.dailyOver === 1 && (this.props.userInfo.classID !== 1 && this.props.userInfo.classID !== 3))) {
                                string += ' -> Over daily hours'
                            }
                            if ((v.valid.weeklyOver === 1 && (this.props.userInfo.classID !== 1 && this.props.userInfo.classID !== 3))) {
                                string += ' -> Over weekly hours'
                            }
                        } else {
                            //If the reservation is available
                            string += ' -> Available';
                            newReservations.push({
                                start: new Date(v.start),
                                end: new Date(v.end)
                            });
                            check = true;
                        }
                        allstrings.push(string);
                    });

                    //Add all the valid reservations to the state along with the result string
                    this.setState({
                        verificationResults: allstrings,
                        modalIsOpen: true,
                        showSubmit: check,
                        validReservations: newReservations
                    });
                }
                catch{
                    alert("Invalid Server Response")
                }
            })
    }

    handleChange(event) {
        //Changes the description or title
        let tempVerify = this.state.showVerify;
        if (event.target.name === "tempTitle") {
            if (event.target.value.length === 0)
                tempVerify[6] = false;
            else
                tempVerify[6] = true;
        }
        else {
            if (event.target.value.length === 0)
                tempVerify[7] = false;
            else
                tempVerify[7] = true;
        }

        this.setState({ [event.target.name]: event.target.value, showVerify: tempVerify });
    }


    recurringFlavorText() {
        //Gets the text for the weekly/monthly dates
        let text = {
            dayofweek: '',
            weekofmonth: '',
            selectedText: this.state.selectedRecurring
        };
        if (this.state.startDate !== null) {
            switch (this.state.startDate.getDay()) {
                case 0:
                    text.dayofweek = 'Sunday';
                    break;
                case 1:
                    text.dayofweek = 'Monday';
                    break;
                case 2:
                    text.dayofweek = 'Tuesday';
                    break;
                case 3:
                    text.dayofweek = 'Wednesday';
                    break;
                case 4:
                    text.dayofweek = 'Thursday';
                    break;
                case 5:
                    text.dayofweek = 'Friday';
                    break;
                case 6:
                    text.dayofweek = 'Saturday';
            }

            switch (this.state.weekInMonth) {
                case 1:
                    text.weekofmonth = 'first';
                    break;
                case 2:
                    text.weekofmonth = 'second';
                    break;
                case 3:
                    text.weekofmonth = 'third';
                    break;
                case 4:
                    text.weekofmonth = 'fourth';
                    break;
                case 5:
                    text.weekofmonth = 'last';
                    break;
            }

            if (text.selectedText === 'Weekly')
                text.selectedText = `Weekly on ${text.dayofweek}`;
            else if (text.selectedText === 'Monthly')
                text.selectedText = `Monthly on the ${text.weekofmonth} ${text.dayofweek}`;
        }
        return text;
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
    }
    afterOpenModal() {
        //this.subtitle.style.color = '#f00';
    }

    handleSubmit() {
        //Get room integer
        let roomID = -1;
        this.props.uniqueRooms.map(e => {
            if (e.title === this.state.selectedRoom)
                roomID = e.id;
        });
        fetch('/insertReservations', {
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.props.userInfo.userID,
                building: this.props.userInfo.buildingID,
                room: roomID,
                title: this.state.tempTitle,
                description: this.state.tempDescription,
                reservations: this.state.validReservations
            })
        }).then(response => {
            try {
                return response.text()
            }
            catch{
                alert("Invalid Server Response")
            }
        })
            .then(() => {

                this.setState({ modalIsOpen: false });

                fetch('/email', {
                    method: 'post',
                    headers: {
                        'Accept': "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: this.props.userInfo.userID,
                        building: this.props.userInfo.buildingID,
                        room: this.state.selectedRoom,
                        title: this.state.tempTitle,
                        description: this.state.tempDescription,
                        reservations: this.state.validReservations,
                        email: this.props.userInfo.email
                    })
                }).then(res => res.text());
                window.location.reload();
            })

    }
    handleGetRooms() {
        fetch('/availableRooms', {
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.props.userInfo.userID,
                building: this.props.userInfo.buildingID,
                startDate: this.state.startDate,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
            })
        }).then(response => {
            try {
                return response.json()
            }
            catch{
                alert("Invalid Server Response")
            }
        })
            .then(valid => {
                try {
                    let rooms = [];
                    valid.map(r => {
                        rooms.push(r.room_name)
                    });

                    this.setState({
                        availableRoomOptions: rooms,
                        showAvailableOptions: true
                    })
                }
                catch{ }
                alert("Invalid Server Response")
            })
    }
    handleAvailable(selected) {
        let tempVerify = this.state.showVerify;
        tempVerify[8] = true;

        let startdate = moment(this.state.startDate).format('YYYY-MM-DD');
        let starttime = moment(this.state.startTime).format('HH:mm:ss');
        let endtime = moment(this.state.endTime).format('HH:mm:ss');

        let reservation = [{
            start: startdate + ' ' + starttime,
            end: startdate + ' ' + endtime
        }];
        this.setState({
            selectedRoom: selected.value,
            showRecurring: true,
            validReservations: reservation,
            showVerify: tempVerify
        })
    }

    render() {
        let roomOptions = ['Any Available Room'];
        this.props.uniqueRooms.map(e => {
            roomOptions.push(e.title)
        });
        let text = this.recurringFlavorText();
        let recurringOptions = ['Does not repeat', `Daily`, `Weekly on ${text.dayofweek}`, `Monthly on the ${text.weekofmonth} ${text.dayofweek}`, 'Custom'];


        return (
            <div>
                <div className='page-title'>Make a Reservation</div>
                <div style={{ background: 'white' }}>

                    <div style={{ width: '20%' }}>
                        <header>Please choose a room:</header>
                        <Dropdown options={roomOptions} onChange={this.handleRooms} value={this.state.selectedRoom} placeholder={"Select a Room"} />
                    </div>
                    {
                        (this.props.userInfo.classID !== 1 && this.props.userInfo.classID !== 3) ? (
                            <div>
                                <header>Daily Hours Left: {this.state.dailyHoursLeft}</header>
                                <header>Weekly Hours Left: {this.state.weeklyHoursLeft}</header>
                            </div>
                        ) : null
                    }

                    <br /><br />

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        Start Date:
                        <DatePicker
                            selected={this.state.startDate}
                            onChange={this.handleStartDateChange}
                            minDate={this.state.semesterStart}
                            maxDate={this.state.semesterEnd}
                            disabled={!this.state.showStartDate}
                            placeholderText="Choose Start Date"

                        />
                        <br />

                        Start Time:
                        <DatePicker
                            selected={this.state.startTime}
                            onChange={this.handleStartTimeChange}
                            showTimeSelect
                            showTimeSelectOnly
                            minTime={this.state.dayStart}
                            maxTime={this.state.maxStartTime}
                            timeIntervals={30}
                            dateFormat="h:mm aa"
                            timeCaption="Start"
                            disabled={!this.state.showStartTime}
                            placeholderText="Choose Start Time"
                        />
                        <br />

                        End Time:
                        <DatePicker
                            selected={this.state.endTime}
                            onChange={this.handleEndTimeChange}
                            showTimeSelect
                            showTimeSelectOnly
                            minTime={this.state.minStartTime}
                            maxTime={this.state.maxEndTime}
                            timeIntervals={30}
                            dateFormat="h:mm aa"
                            timeCaption="End"
                            disabled={!this.state.showEndTime}
                            placeholderText="Choose End Time"
                        />
                        <br /><br /><br />
                    </div>
                    <div style={{ width: '35%' }}>
                        <header>Is this a recurring event?</header>
                        <Dropdown options={recurringOptions} onChange={this.handleRecurring} value={text.selectedText} disabled={!this.state.showRecurring} />
                    </div>
                    {
                        this.state.showEndDate ? (
                            this.state.showCustom ? (
                                <div style={{ padding: '15px' }}>
                                    Repeat Every
                                    <div style={{ display: 'inline-block' }}>
                                        <NumericInput min={1} max={50} value={this.state.recurringNumber} onChange={this.handleNumber} />
                                    </div>

                                    <div style={{ display: 'inline-block' }}>
                                        <Dropdown options={['Days', 'Weeks', 'Months']} onChange={this.handleCustom} value={this.state.customOption} />
                                    </div>

                                    {
                                        this.state.customOption === 'Weeks' ? (
                                            this.props.userInfo.classID === 1 || this.props.userInfo.classID === 3 ? (
                                                <div>
                                                    <button onClick={() => this.handleMultipleDays(1)}> Monday: {this.state.weekdays[1] ? 'ON' : 'OFF'}</button>
                                                    <button onClick={() => this.handleMultipleDays(2)}> Tuesday: {this.state.weekdays[2] ? 'ON' : 'OFF'}</button>
                                                    <button onClick={() => this.handleMultipleDays(3)}> Wednesday: {this.state.weekdays[3] ? 'ON' : 'OFF'}</button>
                                                    <button onClick={() => this.handleMultipleDays(4)}> Thursday: {this.state.weekdays[4] ? 'ON' : 'OFF'}</button>
                                                    <button onClick={() => this.handleMultipleDays(5)}> Friday: {this.state.weekdays[5] ? 'ON' : 'OFF'}</button>
                                                    <button onClick={() => this.handleMultipleDays(6)}> Saturday: {this.state.weekdays[6] ? 'ON' : 'OFF'}</button>
                                                    <button onClick={() => this.handleMultipleDays(0)}> Sunday: {this.state.weekdays[0] ? 'ON' : 'OFF'}</button>
                                                </div>
                                            ) : null
                                        ) : (null)
                                    }

                                    <div style={{ padding: '10px' }}>
                                        End Date:
                                        <DatePicker
                                            selected={this.state.endDate}
                                            onChange={this.handleEndDateChange}
                                            minDate={this.state.startDate}
                                            maxDate={this.state.semesterEnd}
                                            placeholderText="End of recurrence"
                                        />
                                    </div>
                                </div>

                            ) : (
                                    <div style={{ padding: '10px' }}>
                                        End Date:
                                        <DatePicker
                                            selected={this.state.endDate}
                                            onChange={this.handleEndDateChange}
                                            minDate={this.state.startDate}
                                            maxDate={this.state.semesterEnd}
                                            placeholderText="End of recurrence"
                                        />
                                    </div>
                                )
                        ) : (null)
                    }
                    <br /><br />
                    <label class='float-right'>
                        Title:
                        <input name='tempTitle' type="text" maxLength="255" value={this.state.tempTitle} onChange={this.handleChange} />
                    </label>
                    <label class='float-right'>
                        Description:
                        <input name='tempDescription' type="text" maxLength="255" value={this.state.tempDescription} onChange={this.handleChange} />
                    </label>
                    <br /><br />
                    <div>
                        {
                            this.state.showGetRooms ? (
                                <div>
                                    <button disabled={!this.state.showVerify.every((check, index) => { if (index !== 8) return check; else return true; })} onClick={this.handleGetRooms}>Get Available Rooms</button>
                                    {
                                        this.state.availableRoomOptions.length !== 0 ? (
                                            this.state.showAvailableOptions ? (
                                                <Dropdown options={this.state.availableRoomOptions} onChange={this.handleAvailable} value={this.state.selectedRoom} />
                                            ) : null
                                        ) : (
                                                <p>No Rooms Available</p>
                                            )
                                    }
                                </div>
                            ) : null
                        }
                        <button disabled={!this.state.showVerify.every(check => { return check })} onClick={() => this.handleVerify(this.props.uniqueRooms)}>Verify</button>
                    </div>
                    <div>
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            onAfterOpen={this.afterOpenModal}
                            onRequestClose={this.closeModal}
                            style={customStyles}
                            contentLabel="Reservation Modal"
                        >
                            {
                                this.state.verificationResults.map(s => {
                                    return <p>{s}</p>
                                })
                            }
                            <button onClick={this.closeModal}>Close</button>
                            {
                                this.state.showSubmit ? <button className="float-right" onClick={this.handleSubmit}>Submit</button> : null
                            }
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}

export default Reservations;