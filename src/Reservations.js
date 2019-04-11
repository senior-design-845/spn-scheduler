import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./Reservations.css";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import NumericInput from 'react-numeric-input';

class Reservations extends Component {
    constructor(props){
        super(props);
        this.state={
            showRoomMenu: false,    //Toggles drop down
            showStartDate: false,   //Toggles start date calendar
            showStartTime: false,   //Toggles start time menu
            showEndTime: false,     //Toggles end time menu
            showSubmit: false,      //Toggles submit reservation button
            showRecurring: false,
            showEndDate: false,
            showCustom: false,
            showVerify: [false,false,false,false,false,false],
            startDate: null,        //Selected start date
            endDate: null,
            startTime: null,        //Selected start time
            endTime: null,          //Selected end time
            selectedRoom: 'Select Room',
            selectedRecurring: 'Recurring',
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
            weekdays: [false,false,false,false,false,false,false],
            weekInMonth: 0
        }

        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.handleRooms = this.handleRooms.bind(this);
        this.handleRecurring = this.handleRecurring.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.handleNumber = this.handleNumber.bind(this);
        this.handleCustom = this.handleCustom.bind(this);
        this.handleMultipleDays = this.handleMultipleDays.bind(this);
    }

    componentDidMount() {
        fetch('/semester',{
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                building: 1
            })
        }).then(response => response.json())
            .then( semester =>{
                this.setState({semesterStart: new Date(semester.semester_start), semesterEnd: new Date(semester.semester_end)})
            })
    }

    handleRooms(selected){
        //Room has been selected
        let tempVerify = this.state.showVerify;
        tempVerify[0] = true;

        this.setState({selectedRoom: selected.value, showStartDate: true, showVerify: tempVerify})
    }

    handleStartDateChange(date){
        let tempDate = new Date(date);

        //Gets the week number of the month of the selected date
        let month = tempDate.getMonth();
        let count = 0;
        while(tempDate.getMonth() === month) {
            tempDate.setDate(tempDate.getDate() - 7);
            count++;
        }

        //Start date has been selected but start and end times need to be reselected
        let tempVerify = this.state.showVerify;
        tempVerify[1] = true;
        tempVerify[2] = false;
        tempVerify[3] = false;

        //Sets the weekday value
        let days = [false,false,false,false,false,false,false];
        days[date.getDay()] = true;

        fetch('/hours',{
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: 1,
                room: this.state.selectedRoom,
                building: 1,
                startDate: date
            })
        }).then(response => response.json())
            .then( hours => {
                if(hours.dailyHours > 0 && hours.weeklyHours > 0){
                    //Getting the date variables for the dayStart and dayEnd state values
                    let tempTime = String(hours.dayStart).split(/[:]/);
                    let tempDate = new Date();
                    tempDate.setMinutes(parseInt(tempTime[1],10));
                    tempDate.setHours(parseInt(tempTime[0], 10));
                    let tempDate2 = new Date();
                    tempTime =  String(hours.dayEnd).split(/[:]/);
                    tempDate2.setMinutes(parseInt(tempTime[1],10));
                    tempDate2.setHours(parseInt(tempTime[0], 10));


                    this.setState({
                        dailyHoursLeft: hours.dailyHours,
                        weeklyHoursLeft: hours.weeklyHours,
                        maxStartTime: new Date(new Date(tempDate2).setMinutes(tempDate2.getMinutes()-30)),
                        startDate: date,
                        dayStart: tempDate,
                        dayEnd: tempDate2,
                        showStartTime: true,
                        showEndTime: false,
                        showRecurring: true,
                        endDate: this.state.endDate <= date ? null: this.state.endDate,
                        startTime: null,
                        endTime: null,
                        weekInMonth: count,
                        showVerify: tempVerify,
                        weekdays: days
                    })
                }
                else{
                    this.setState({
                        dailyHoursLeft: hours.dailyHours,
                        weeklyHoursLeft: hours.weeklyHours,
                        startDate: date,
                        startTime: null,
                        endTime: null,
                        showStartTime: false,
                        showEndTime: false,
                        showRecurring: true,
                        endDate: this.state.endDate <= date ? null: this.state.endDate,
                        weekInMonth: count,
                        showVerify: tempVerify,
                        weekdays: days
                    })
                }
            });
    }

    handleStartTimeChange(date){
        //Restricts endTime based on user hours-> Math.min(this.state.dayEnd, new Date(date).setMinutes(date.getMinutes() + Math.min(this.state.dailyHoursLeft, this.state.weeklyHoursLeft)*60))

        //Start time has been selected, end time needs to be chosen if empty or re-chosen if time is before new start time
        let tempVerify = this.state.showVerify;
        tempVerify[2] = true;
        if(this.state.endTime <= date)
            tempVerify[3] = false;

        let end = null;
        if(this.state.endTime !== null)
            end = this.state.endTime.getTime() <= date.getTime() ? null : this.state.endTime;


        this.setState({
            startTime: date,
            minStartTime: new Date(new Date(date).setMinutes(date.getMinutes()+30)),
            maxEndTime: new Date(this.state.dayEnd),
            showEndTime: true,
            endTime: end,
            showVerify: tempVerify
        });
    }
    handleEndTimeChange(date){
        //End time has been selected
        let tempVerify = this.state.showVerify;
        tempVerify[3] = true;
        this.setState({ endTime: date, showVerify: tempVerify});
    }

    handleRecurring(selected){
        //Removes the unique day/week text so that string.include() can be called less in other functions
        let choice = selected.value;
        if(choice.includes('Weekly'))
            choice = 'Weekly';
        else if(choice.includes('Monthly'))
            choice = 'Monthly';

        //Recurring has been selected, if it is not 'Does not repeat' then an end date needs to be chosen
        let tempVerify = this.state.showVerify;
        tempVerify[4] = true;
        tempVerify[5] = selected.value === 'Does not repeat';

        //Sets the weekday value
        let days = [false,false,false,false,false,false,false];
        days[this.state.startDate.getDay()] = true;

        this.setState({
            showEndDate: selected.value !== 'Does not repeat',
            showCustom: selected.value === 'Custom',
            selectedRecurring: choice,
            endDate: null,
            customOption: selected.value === 'Custom' ? 'Days':'',
            recurringNumber: 1,
            showVerify: tempVerify,
            weekdays: days
        })
    }

    handleEndDateChange(date){
        //Recurring has been selected, if it is not 'Does not repeat' then an end date needs to be chosen
        let tempVerify = this.state.showVerify;
        tempVerify[5] = true;
        this.setState({endDate: date, showVerify: tempVerify})
    }

    handleNumber(number){
        this.setState({recurringNumber: number})
    }

    handleCustom(selected){
        let weekdays = [false,false,false,false,false,false,false];
        if(selected.value === 'Weeks')
            weekdays[this.state.startDate.getDay()] = true;
        this.setState({customOption: selected.value, weekdays: weekdays})
    }

    handleMultipleDays(i){
        let w = this.state.weekdays;
        w[i] = !this.state.weekdays[i];
        let none = true;
        for(let k=0; k<7;k++)
            if(w[k])
                none = false;
        if(none)
            w[this.state.startDate.getDay()] = true;
        this.setState({weekdays: w})
    }

    handleVerify(uniqueRooms){
        //Get room integer
        let roomID =-1;
        uniqueRooms.map(e => {
            if(e.title === this.state.selectedRoom)
                roomID = e.id;
        });

        let resDates = [];
        if(this.state.selectedRecurring === 'Does not repeat') {
            resDates = [this.state.startDate];
        }
        else{
            let tempDate = new Date(this.state.startDate);

            if(this.state.selectedRecurring=== 'Daily' || this.state.customOption==='Days'){
                while(tempDate <= this.state.endDate){

                    resDates.push(new Date(tempDate));
                    tempDate.setDate(tempDate.getDate()+ this.state.recurringNumber)
                }
            }
            else if(this.state.selectedRecurring==='Weekly' || this.state.customOption==='Weeks'){
                    while (tempDate <= this.state.endDate){
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
            }
            else if(this.state.selectedRecurring==='Monthly' || this.state.customOption==='Months'){
                let month = this.state.startDate.getMonth();
                while(tempDate <= this.state.endDate){
                    resDates.push(new Date(tempDate));
                    while(tempDate.getMonth() === month){
                        tempDate.setDate(tempDate.getDate() + 7);
                    }
                    let addNum = this.state.weekInMonth - (this.state.weekInMonth===5 ? 2 : 1);
                    tempDate.setDate(tempDate.getDate() + (7* (addNum)));
                    month = month===12 ? 1 : month+1;
                }
            }
        }

        fetch('/verifyReservations',{
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: 1,
                building: 1,
                reservations: resDates,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                roomID: roomID
            })
        }).then(response => response.json())
            .then(valid => {

                this.props.onEventUpdate(valid);

            })

    }

    recurringFlavorText(){
        let text = {
            dayofweek: '',
            weekofmonth: '',
            selectedText: this.state.selectedRecurring
        };
        if(this.state.startDate !== null) {
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

    render(){
        let uniquerooms = [];
        this.props.uniqueRooms.map(e => {
            uniquerooms.push(e.title)
        })
        let text = this.recurringFlavorText();
        let recurringOptions = ['Does not repeat', `Daily`, `Weekly on ${text.dayofweek}`, `Monthly on the ${text.weekofmonth} ${text.dayofweek}`, 'Custom'];

        return(
            <div style={{height:'400px'}}>

                <div style={{width:'20%'}}>
                    <Dropdown options={uniquerooms} onChange={this.handleRooms} value={this.state.selectedRoom} placeholder={"Select a Room"}/>
                </div>
                <header>Daily Hours Left: {this.state.dailyHoursLeft}</header>
                <header>Weekly Hours Left: {this.state.weeklyHoursLeft}</header>
                <br/><br/>

                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <DatePicker
                        selected={this.state.startDate}
                        onChange={this.handleStartDateChange}
                        minDate={this.state.semesterStart}
                        maxDate={this.state.semesterEnd}
                        disabled={!this.state.showStartDate}
                        placeholderText="Please choose a room option"
                    />
                    <br/>
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
                        placeholderText="Please choose a Start date"
                    />
                    <br/><br/>
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
                        placeholderText="Please choose a Start time"
                    />
                    <br/>
                </div>
                <div style={{width:'35%'}}>
                    <Dropdown  options={recurringOptions} onChange={this.handleRecurring} value={text.selectedText} disabled={!this.state.showRecurring}/>
                </div>
                {
                    this.state.showEndDate ? (
                        this.state.showCustom ? (
                            <div style={{padding: '15px'}}>
                                Repeat Every
                                <div style={{display:'inline-block'}}>
                                    <NumericInput min={1} max={50} value={this.state.recurringNumber} onChange={this.handleNumber}/>
                                </div>

                                <div style={{display:'inline-block'}}>
                                    <Dropdown options={['Days','Weeks','Months']} onChange={this.handleCustom} value={this.state.customOption}/>
                                </div>

                                {
                                    this.state.customOption === 'Weeks' ? (
                                      <div>
                                        <button onClick={() => this.handleMultipleDays(1)}> Monday: {this.state.weekdays[1] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleMultipleDays(2)}> Tuesday: {this.state.weekdays[2] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleMultipleDays(3)}> Wednesday: {this.state.weekdays[3] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleMultipleDays(4)}> Thursday: {this.state.weekdays[4] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleMultipleDays(5)}> Friday: {this.state.weekdays[5] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleMultipleDays(6)}> Saturday: {this.state.weekdays[6] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleMultipleDays(0)}> Sunday: {this.state.weekdays[0] ? 'ON' : 'OFF'}</button>
                                      </div>
                                    ): (null)
                                }

                                <div style={{padding:'10px'}}>
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
                            <div style={{padding: '10px'}}>
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
                <br/><br/>
                <div>
                    <button disabled={!this.state.showVerify.every(check => {return check})} onClick={() => this.handleVerify(this.props.uniqueRooms)}>Verify</button>
                </div>
            </div>
        );
    }
}

export default Reservations;