import React, {Component} from 'react';
import moment from 'moment'
import dateFormat from 'dateformat'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./Reservations.css";

class Reservations extends Component {
    constructor(props){
        super(props);
        this.state={
            showRoomMenu: false,
            showStartDate: false,
            showStartTime: false,
            showEndTime: false,
            startDate: null,
            startTime: null,
            endTime: null,
            selectedRoom: 'Select Room',
            hoursLeft: 0,
            dayStart: new Date(),
            dayEnd: new Date()
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
            .then( weeklyHours => {
                this.setState({
                    hoursLeft: weeklyHours.HoursLeft,
                    dayStart: Date.parse(),
                    dayEnd: Date.parse(),
                    showStartTime: true
                })
                console.log(this.state)
            })



        this.setState({ startDate: date });
    }
    handleStartTimeChange(date){
        this.setState({ startTime: date, showEndTime: true});
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
                <br/><br/>
                <DatePicker
                    selected={this.state.startTime}
                    onChange={this.handleStartTimeChange}
                    showTimeSelect
                    showTimeSelectOnly
                    minTime={this.state.dayStart}
                    maxTime={this.state.dayEnd}
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
                    //minTime={this.state.startTime.getTime()}
                    //maxTime={this.state.startDate.getTime()}
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