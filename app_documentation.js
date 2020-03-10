import React, { Component } from 'react';
import './App.css';
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import Reservations from './Reservations.js'
import { BrowserRouter as Router, Route, Link} from "react-router-dom";

BigCalendar.momentLocalizer(moment);

//app class that contains necessary vlaues and funtions to handle showing all toggled on rooms on the calendar app
class App extends Component {



    constructor(props) {
        super(props);
        this.state = {
            reservations: [],
            uniqueRooms: [],
            events: [],
            roomEvents: [],
            buttonToggle: [],
            allToggle: true,
        };

        this.handleRoomClick = this.handleRoomClick.bind(this);
        this.handleAllClick = this.handleAllClick.bind(this);
    }

    //
    componentDidMount(){
        let colors = [ '#e6194b', '#3cb44b', '#14bfb1', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075' ]
        //var colors = [ '#ce93d8', '#8e24aa', '#ab47bc', '#64b5f6', '#2196f3', '#1976d2', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075' ]
        let i = 0;

        //Get the room reservation data from the server
        fetch('/calendar',{
            method: 'post',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userID: this.props.location.state.userID,
                buildingID: this.props.location.state.buildingID
            })
        }).then(response => {
            try{
                return response.json()
            }
            catch{
                alert("Invalid Server Response")
            }
        })
            .then(reservations => {
                //Parse through the data and update the state
                let uniquerooms = [];
                let temp = [];
                let buttons = [];
                reservations.map(record => {
                    let roomid = this.search(record.room_name, uniquerooms);
                    if( roomid === -1 ) {
                        //This event is in a new room, so add the room to uniqueRooms and push a new array of events into roomEvents
                        uniquerooms.push({
                            id: record.roomID,
                            title: record.room_name,
                            color: colors[i]

                        });

                        if (i === 16)
                            i= 0;
                        else i++;

                        buttons.push(true);

                        temp.push([{
                            'id': uniquerooms.length-1,
                            'title': `\n${record.last_name}\nProject: ${record.team_num}\nTitle: ${record.title}`,
                            'start': new Date( Date.parse(record.start_datetime) ),
                            'end': new Date (Date.parse(record.end_datetime) )
                        }])
                    }
                    else {
                        //This room already exists, so add the event to the existing room events array
                        temp[roomid].push({
                            'id': roomid,
                            'title': `\n${record.last_name}\nProject: ${record.team_num}\nTitle: ${record.title}`,
                            'start': new Date(Date.parse(record.start_datetime)),
                            'end': new Date(Date.parse(record.end_datetime))

                        });
                    }

                });

                //Pull all the events from roomEvents' arrays and add them to events as default calendar view
                let totaltemp = temp[0];
                for(let i=1; i<temp.length; i++){
                    totaltemp = totaltemp.concat(temp[i])
                }
                this.setState({reservations: reservations, events: totaltemp, roomEvents: temp, uniqueRooms: uniquerooms, buttonToggle: buttons})
            });

    }

    handleRoomClick(i){
        //Switch this room to opposite state
        let toggleTemp = this.state.buttonToggle;
        toggleTemp[i] = !toggleTemp[i];

        //Rebuild the events shown with those that are ON
        let temp = [];
        for(let i =0; i< toggleTemp.length; i++){
            if(toggleTemp[i]){
                temp = temp.concat(this.state.roomEvents[i]);
            }
        }

        this.setState({
            buttonToggle: toggleTemp,
            events: temp
        });
    }

    handleAllClick(){
        //Turn all the rooms off or on
        let toggleTemp = this.state.buttonToggle;
        let allTemp = !this.state.allToggle;
        let temp = [];
        for(let i=0; i<toggleTemp.length; i++){
            toggleTemp[i] = allTemp;
            if(toggleTemp[i]){
                temp = temp.concat(this.state.roomEvents[i]);
            }
        }

        this.setState({
            buttonToggle: toggleTemp,
            events: temp,
            allToggle: allTemp
        })
    }

    search(nameKey, myArray){
        for(let i=0; i<myArray.length; i++){
            if(myArray[i].title === nameKey)
                return i;
        }
        return -1;
    }

    //render will provide visuals for the calendar app page
    render() {
    return (
        <div>
            //sets the background color of the page
            <style>
                {document.body.style = 'background: #62d2ff;'}
            </style>
            //
            {this.state.uniqueRooms.map((e) => (
                <button key={e.id} style={{backgroundColor: e.color}} onClick={() => this.handleRoomClick(this.search(e.title, this.state.uniqueRooms))}>
                    {e.title + ': '}{this.state.buttonToggle[this.search(e.title, this.state.uniqueRooms)] ? 'ON' : 'OFF'}
                </button>
            ))}
            //a button which toggles the visibility of the scheduled times of rooms on the calendar
            <button onClick={() => this.handleAllClick()}>
                Toggle All Rooms: {this.state.allToggle ? 'ALL' : 'NONE'}
            </button>
            <div id = 'routing-table'>
                <Link id="link" to={{
                    pathname: '/myreservations',
                    state: this.props.location.state
                }}>My Reservations</Link>
                <br/>
                {
                    this.props.location.state.classID === 1 ? (
                        <Link id="link" to={{
                            pathname: '/admin',
                            state: this.props.location.state
                        }}>Admin</Link>
                    ) : (null)
                }
                <br/>
                <Link id="link" to={'/login'}>Logout</Link>
            </div>
            <br/><br/>
            //sets the default view of the calendar, the buttons can be used to change the view of the calendar
            //between monthly, weekly, or daily. Also sets the background color of the calendar to white.
            <div style={{height: 700}}>
                <BigCalendar
                    style={{background: 'white'}}
                    events={this.state.events}
                    step={30}
                    defaultView='week'
                    views={['month','week','day']}
                    defaultDate={new Date()}
                    startAccessor = 'start'
                    endAccessor = 'end'
                    eventPropGetter={(event) => ({
                        style:{
                            backgroundColor: this.state.uniqueRooms[event.id].color
                        }
                    })}
                />
            </div>
            <Reservations uniqueRooms={this.state.uniqueRooms} userInfo={this.props.location.state}/>
        </div>
    );
  }
}

export default App;
