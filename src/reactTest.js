import React, {Component} from 'react';
import Timeline from 'new-react-calendar-timeline/lib';
import moment from 'moment';
import ReactCalendarTimeline from "new-react-calendar-timeline/lib";


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


        var minTime = moment().add(-6, 'months').valueOf()
        var maxTime = moment().add(6, 'months').valueOf()

        var props = {
            groups: uniquerooms,
            items: events,
            fixedHeader: 'fixed',
            canMove: false, // defaults
            canResize: false,
            itemsSorted: true,
            itemTouchSendsClick: false,
            stackItems: true,
            itemHeightRatio: 0.75,
            dragSnap: moment.duration(1, 'days').asMilliseconds(),

            defaultTimeStart: moment().add(-7, 'day'),
            defaultTimeEnd: moment().add(7, 'day'),

            maxZoom: moment.duration(2, 'months').asMilliseconds(),
            minZoom: moment.duration(3, 'days').asMilliseconds(),

            keys: {
                groupIdKey: 'id',
                groupTitleKey: 'title',
                itemIdKey: 'id',
                itemTitleKey: 'title',
                itemGroupKey: 'group',
                itemTimeStartKey: 'start',
                itemTimeEndKey: 'end'
            },

            onItemClick: function (item) {
                console.log("Clicked: " + item);
            },

            onItemSelect: function (item) {
                console.log("Selected: " + item);
            },

            onItemContextMenu: function (item) {
                console.log("Context Menu: " + item);
            },


            // this limits the timeline to -6 months ... +6 months
            onTimeChange: function (visibleTimeStart, visibleTimeEnd) {
                if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
                    this.updateScrollCanvas(minTime, maxTime)
                } else if (visibleTimeStart < minTime) {
                    this.updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
                } else if (visibleTimeEnd > maxTime) {
                    this.updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
                } else {
                    this.updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
                }
            }
        }
        var filter = React.createElement("div", {}, "The Calendar");


        return <Timeline groups={uniquerooms}
                           items={events}
                           defaultTimeStart={moment().add(-12, 'hour')}
                           defaultTimeEnd={moment().add(2, 'week')}
        />
        //return React.createElement(ReactCalendarTimeline['default'], props, filter);
    }


    render(){
        return(
            this.calendar()
            /*<div>
                {this.state.reservations.map(record => (
                    <p>Start: {record.start_datetime}   End: {record.end_datetime}</p>
                ))}
            </div>*/
        );
    }
}

export default Reservations;
