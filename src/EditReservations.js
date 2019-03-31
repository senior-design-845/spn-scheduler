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
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'ContentType': 'application/json',
            },
            body: JSON.stringify({
                uid: this.state.userID,
                bid: this.state.buildingID,
            }),
        })
            //.then(response => response.json())
            /*.then(reservations => {

                reservations.map(record => {

                });
            });*/
    }

    render() {

        return null;
    }
}

export default EditReservations;