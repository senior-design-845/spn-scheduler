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
            weekdays: []
        }

        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.handleDropdown = this.handleDropdown.bind(this);
        this.handleRecurring = this.handleRecurring.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.handleNumber = this.handleNumber.bind(this);
        this.handleCustom = this.handleCustom.bind(this);
        this.handleWeekdays = this.handleWeekdays.bind(this);
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
                this.setState({semesterStart: semester.semester_start, semesterEnd: semester.semester_end})
            })
    }

    handleStartDateChange(date){
        fetch('/reservations',{
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
                    tempDate.setMinutes(parseInt(tempTime[1],10))
                    tempDate.setHours(parseInt(tempTime[0], 10))
                    let tempDate2 = new Date();
                    tempTime =  String(hours.dayEnd).split(/[:]/);
                    tempDate2.setMinutes(parseInt(tempTime[1],10))
                    tempDate2.setHours(parseInt(tempTime[0], 10))


                    this.setState({
                        dailyHoursLeft: hours.dailyHours,
                        weeklyHoursLeft: hours.weeklyHours,
                        maxStartTime: new Date(new Date(tempDate2).setMinutes(tempDate2.getMinutes()-30)),
                        startDate: date,
                        dayStart: tempDate,
                        dayEnd: tempDate2,
                        showStartTime: true,
                        showRecurring: false,
                        showEndDate: false,
                        startTime: null,
                        endTime: null,
                        endDate: null,
                        selectedRecurring: 'Recurring'
                    })
                }
                else{
                    this.setState({
                        dailyHoursLeft: hours.dailyHours,
                        weeklyHoursLeft: hours.weeklyHours,
                        startDate: date,
                        startTime: null,
                        endTime: null,
                        endDate: null,
                        showStartTime: false,
                        showEndTime: false,
                        showRecurring: false,
                        showEndDate: false,
                        selectedRecurring: 'Recurring'
                    })
                }
            })
    }

    handleStartTimeChange(date){
        this.setState({
            startTime: date,
            minStartTime: new Date(new Date(date).setMinutes(date.getMinutes()+30)),
            maxEndTime: new Date(Math.min(this.state.dayEnd, new Date(date).setMinutes(date.getMinutes() + Math.min(this.state.dailyHoursLeft, this.state.weeklyHoursLeft)*60))),
            showEndTime: true,
            endTime: null,
            showRecurring: false,
            showEndDate: false,
            endDate: null,
            selectedRecurring: 'Recurring'
        });
    }
    handleEndTimeChange(date){
        this.setState({ endTime: date,
            showRecurring: true});
    }

    handleDropdown(selected){
        this.setState({selectedRoom: selected.value, showStartDate: true})
    }

    handleRecurring(selected){
        this.setState({
            showEndDate: selected.value != 'Does not repeat' ? true : false,
            showCustom: selected.value === 'Custom' ? true : false,
            selectedRecurring: selected.value,
            endDate: null,
            customOption: '',
            recurringNumber: 0,
            weekdays: []
        })
    }

    handleEndDateChange(date){
        this.setState({endDate: date})
    }

    handleNumber(number){
        this.setState({recurringNumber: number})
    }

    handleCustom(selected){
        let w = [false,false,false,false,false,false,false];
        if(selected.value == 'Weeks')
            w[this.state.startDate.getDay()] = true;
        this.setState({customOption: selected.value, weekdays: w})
    }

    handleWeekdays(i){
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

    render(){
        let uniquerooms = []
        this.props.uniqueRooms.map(e => {
            uniquerooms.push(e.title)
        })
        let dayofweek =''
        let weekofmonth =''
        if(this.state.startDate != null) {
            let tempDate = new Date(this.state.startDate);
            let month = tempDate.getMonth();

            switch(this.state.startDate.getDay()){
                case 0: dayofweek = 'Sunday'; break;
                case 1: dayofweek = 'Monday'; break;
                case 2: dayofweek = 'Tuesday'; break;
                case 3: dayofweek = 'Wednesday'; break;
                case 4: dayofweek = 'Thursday'; break;
                case 5: dayofweek = 'Friday'; break;
                case 6: dayofweek = 'Saturday';
            }

            let count = 0;

            while(tempDate.getMonth() == month){
                tempDate.setDate(tempDate.getDate() - 7);
                count++;
            }

            switch(count){
                case 1: weekofmonth = 'first'; break;
                case 2: weekofmonth = 'second'; break;
                case 3: weekofmonth = 'third'; break;
                case 4: weekofmonth = 'fourth'; break;
                case 5: weekofmonth = 'last'; break;
            }

        }

        let recurringOptions = ['Does not repeat', `Daily`, `Weekly on ${dayofweek}`, `Monthly on the ${weekofmonth} ${dayofweek}`, 'Custom']

        return(
            <div style={{height:'450px'}}>

                <div style={{width:'20%'}}>
                    <Dropdown options={uniquerooms} onChange={this.handleDropdown} value={this.state.selectedRoom} placeholder={"Select a Room"}/>
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
                        timeFormat="HH:mm"
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
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="h:mm aa"
                        timeCaption="End"
                        disabled={!this.state.showEndTime}
                        placeholderText="Please choose a Start time"
                    />
                    <br/>
                </div>
                <div style={{width:'30%'}}>
                    <Dropdown  options={recurringOptions} onChange={this.handleRecurring} value={this.state.selectedRecurring} disabled={!this.state.showRecurring}/>
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
                                    this.state.customOption == 'Weeks' ? (
                                      <div>
                                        <button onClick={() => this.handleWeekdays(1)}> Monday: {this.state.weekdays[1] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleWeekdays(2)}> Tuesday: {this.state.weekdays[2] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleWeekdays(3)}> Wednesday: {this.state.weekdays[3] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleWeekdays(4)}> Thursday: {this.state.weekdays[4] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleWeekdays(5)}> Friday: {this.state.weekdays[5] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleWeekdays(6)}> Saturday: {this.state.weekdays[6] ? 'ON' : 'OFF'}</button>
                                        <button onClick={() => this.handleWeekdays(0)}> Sunday: {this.state.weekdays[0] ? 'ON' : 'OFF'}</button>
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
                    <header>Submit button</header>
                </div>
            </div>
        );
    }
}

export default Reservations;