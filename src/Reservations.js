import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./Reservations.css";

class Reservations extends Component {
    constructor(props){
        super(props);
        this.state={
            showRoomMenu: false,    //Toggles drop down
            showStartDate: false,   //Toggles start date calendar
            showStartTime: false,   //Toggles start time menu
            showEndTime: false,     //Toggles end time menu
            startDate: null,        //Selected start date
            startTime: null,        //Selected start time
            endTime: null,          //Selected end time
            selectedRoom: 'Select Room',
            dailyHoursLeft: 0,           //Hours of reservation time left for the user pulled from db
            weeklyHoursLeft: 0,
            dayStart: null,         //Room open time pulled from db
            dayEnd: null,           //Room close time pulled from db
            maxStartTime: null,     //30 minutes before dayEnd
            minStartTime: null,     //30 minutes after chosen StartTime
            maxEndTime: null        //Min of dayEnd and ( chosen StartTime + hoursLeft)
        }

        this.showRoomMenu = this.showRoomMenu.bind(this);
        this.closeRoomMenu = this.closeRoomMenu.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.handleDropdown = this.handleDropdown.bind(this);
    }

    showRoomMenu(event){
        event.preventDefault();

        this.setState({showRoomMenu: true}, () => {
            document.addEventListener('click', this.closeRoomMenu);
        });
    }

    closeRoomMenu(event){
        if(!this.dropdownMenu.contains(event.target)){
            this.setState({showRoomMenu: false}, () => {
                document.removeEventListener('click', this.closeRoomMenu);
            });
        }
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
                        dayStart: tempDate,
                        dayEnd: tempDate2,
                        showStartTime: true,
                        startTime: null,
                        endTime: null
                    })
                }
                else{
                    this.setState({
                        dailyHoursLeft: hours.dailyHours,
                        weeklyHoursLeft: hours.weeklyHours,
                        startTime: null,
                        endTime: null,
                        showStartTime: false,
                        showEndTime: false
                    })
                }
            })



        this.setState({ startDate: date });
    }
    handleStartTimeChange(date){
        this.setState({
            startTime: date,
            minStartTime: new Date(new Date(date).setMinutes(date.getMinutes()+30)),
            maxEndTime: new Date(Math.min(this.state.dayEnd, new Date(date).setMinutes(date.getMinutes() + Math.min(this.state.dailyHoursLeft, this.state.weeklyHoursLeft)*60))),
            showEndTime: true});
    }
    handleEndTimeChange(date){
        this.setState({ endTime: date});
    }

    handleDropdown(i){
        this.setState({selectedRoom: this.props.uniqueRooms[i].title, showStartDate: true})
    }


    render(){
        return(
            <div>
                <div className="dropdown">
                <button className="dropbtn" onClick={this.showRoomMenu}>
                    {this.state.selectedRoom}
                </button>

                {
                    this.state.showRoomMenu ? (
                        <div className="dropdown-content"
                            ref={(element) => {
                                this.dropdownMenu = element;
                            }}
                        >
                            {this.props.uniqueRooms.map((e) => (
                                <button onClick={() => this.handleDropdown(e.id) }>
                                    {e.title}
                                </button>
                            ))}
                        </div>
                    ) : ( null )
                }
                </div>
                <br/><br/>
                <DatePicker
                    selected={this.state.startDate}
                    onChange={this.handleStartDateChange}
                    disabled={!this.state.showStartDate}
                    placeholderText="Please choose a room option"
                />
                <header>Daily Hours Left: {this.state.dailyHoursLeft}</header>
                <header>Weekly Hours Left: {this.state.weeklyHoursLeft}</header>
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
        );
    }
}

export default Reservations;