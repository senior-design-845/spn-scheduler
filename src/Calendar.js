import React, {Component} from 'react';
import Timeline from 'new-react-calendar-timeline/lib';
import moment from 'moment';

class Reservations extends Component {
    constructor(props) {
        super(props);
        this.state = {reservations: []};
    }
    componentDidMount(){
        fetch('/reservation')
            .then(response => response.json())
            .then(reservations_ => (this.setState({reservations: reservations_})))
    }

    search(nameKey, myArray){
        for(var i=0; i<myArray.length; i++){
            if(myArray[i].title === nameKey)
                return myArray[i].id;
        }
        return -1;
    }
    calendar(){
        var uniquerooms = [];
        var events = [];

        this.state.reservations.map(record => {
            if( this.search(record.room_name, uniquerooms) == -1 )
                uniquerooms.push({
                    id: uniquerooms.length +1,
                    title: record.room_name
                });

            console.log(record.start_datetime);
            events.push({
                id: events.length+1,
                group: this.search(record.room_name, uniquerooms),
                title: 'Event ' + events.length+1,
                start_time: Date.parse(record.start_datetime),
                end_time: Date.parse(record.end_datetime)
            });
        })


        return <Timeline groups={uniquerooms}
                           items={events}
                           defaultTimeStart={moment().add(-12, 'hour')}
                           defaultTimeEnd={moment().add(2, 'week')}
        />
    }


    render(){
        return(
            this.calendar()
        );
    }
}

export default Reservations;
