import React, {Component} from 'react';
import './EditReservations.css'

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID : 98,
            buildingID : 1,
            events : []
        }
    }

    // This is the creation of the list items
    createItem(item) {
        return(
            <div className='dd-list-container'>
                <div className = 'dd-list-header'>
                    <div className = 'event-title'>
                        {item.title}
                    </div>
                    <div className = 'event-date'>
                        {item.start_datetime}
                    </div>
                </div>
                <ul className = 'dd-list-items'>
                    <li>{item.event_detail}</li>
                </ul>
            </div>
        );
    }

    createItems(items) {
        return(
            <div className = 'dd-list-wrapper'>
                    {items.map(this.createItem)}
            </div>
        );
    }

    componentDidMount(){
        //Get the room reservation data from the server
        fetch('/userReservations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: this.state.userID,
                bid: this.state.buildingID,
            }),
        })
            .then(response => response.json())
            .then(reservations => {
                let events = [];

                reservations.map(record => {
                    events.push({
                        roomID: record.roomID,
                        start_datetime: record.start_datetime,
                        end_datetime: record.end_datetime,
                        title: record.title,
                        event_detail: record.event_detail,
                        recurring_recordID: record.recurring_recordID
                    });
                    return null;
                });

                this.setState({events: events});
            });
    }

    render() {
        return(this.createItems(this.state.events));
    }
}

class eventComponent extends Component {

}


export default EditReservations;