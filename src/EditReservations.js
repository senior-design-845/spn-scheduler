import React, {Component} from 'react';

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID : 56,
            buildingID : 1
        }
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
                });
            });
    }

    render() {

        return null;
    }
}

export default EditReservations;