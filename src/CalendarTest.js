import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

BigCalendar.momentLocalizer(moment);

class calendarApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reservations: [],
            events: [],
            check: -1
        };
    }

    componentDidMount(){
        fetch('/reservation')
            .then(response => response.json())
            .then(reservations_ => (this.setState({reservations: reservations_})));
    }

    search(nameKey, myArray){
        for(let i=0; i<myArray.length; i++){
            if(myArray[i].title === nameKey)
                return myArray[i].id;
        }
        return -1;
    }
    calendar(){
        let uniquerooms = [];
        let temp = [];
        let a = 0;
        this.state.reservations.map(record => {
            if( this.search(record.room_name, uniquerooms) === -1 )
                uniquerooms.push({
                    id: uniquerooms.length +1,
                    title: record.room_name
                });
            temp.push({
                'title': 'Event ' + temp.length+1,
                'start': new Date( Date.parse(record.start_datetime) ),
                'end': new Date (Date.parse(record.end_datetime) )

            });
            a++;
        });

        return(
            <div>
                <header>{}</header>
                <div style={{height: 700}}>
                    <BigCalendar
                        events={temp}
                        step={30}
                        defaultView='week'
                        views={['month','week','day']}
                        defaultDate={new Date()}
                        startAccessor = 'start'
                        endAccessor = 'end'
                    />
                </div>
            </div>
        )

    }


    render() {
        return (
            this.calendar()
        );
    }
}

export default calendarApp;
