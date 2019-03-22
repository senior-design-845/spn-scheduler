import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

BigCalendar.momentLocalizer(moment);

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reservations: [],
            uniqueRooms: [],
            events: [],
            roomEvents: [],
            buttonToggle: []
        };

        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount(){
        fetch('/reservation')
            .then(response => response.json())
            .then(reservations => {
                let uniquerooms = [];
                let temp = [];
                let buttons = [];

                reservations.map(record => {
                    let roomid = this.search(record.room_name, uniquerooms);
                    if( roomid === -1 ) {
                        uniquerooms.push({
                            id: uniquerooms.length,
                            title: record.room_name,
                            color: '#'+Math.floor(Math.random()*16777215).toString(16)
                        });
                        buttons.push(true);

                        temp.push([{
                            'id': uniquerooms.length,
                            'title': 'Event ' + temp.length+1,
                            'start': new Date( Date.parse(record.start_datetime) ),
                            'end': new Date (Date.parse(record.end_datetime) )
                        }])
                    }
                    else {
                        temp[roomid].push({
                            'id': roomid,
                            'title': 'Event ' + temp.length + 1,
                            'start': new Date(Date.parse(record.start_datetime)),
                            'end': new Date(Date.parse(record.end_datetime))

                        });
                    }
                });

                let totaltemp = temp[0];
                for(let i=1; i<temp.length; i++){
                    totaltemp = totaltemp.concat(temp[i])
                }
                this.setState({reservations: reservations, events: totaltemp, roomEvents: temp, uniqueRooms: uniquerooms, buttonToggle: buttons})
            });
    }

    handleClick(i){
        //Switch this room to OFF
        let toggleTemp = this.state.buttonToggle
        toggleTemp[i] = !toggleTemp[i]

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

    search(nameKey, myArray){
        for(let i=0; i<myArray.length; i++){
            if(myArray[i].title === nameKey)
                return myArray[i].id;
        }
        return -1;
    }



    render() {
    return (
        <div>
            <heading></heading>
            {this.state.uniqueRooms.map((e) => (
                <button style={{backgroundColor: e.color }} onClick={() => this.handleClick(e.id) }>
                    {e.title + ': '}{ this.state.buttonToggle[e.id] ? 'ON' : 'OFF'}
                </button>
            ))}
            <br/><br/>
            <div style={{height: 700}}>
                <BigCalendar
                    events={this.state.events}
                    step={30}
                    defaultView='week'
                    views={['month','week','day']}
                    defaultDate={new Date()}
                    startAccessor = 'start'
                    endAccessor = 'end'
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: this.state.uniqueRooms[event.id].color
                        }
                    })}
                />
            </div>
        </div>
    );
  }
}

export default App;
