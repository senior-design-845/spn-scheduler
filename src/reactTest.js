import React, {Component} from 'react';
import ReactDOM from 'react-dom';

class Reservations extends Component {
    constructor(props) {
        super(props);
        this.state = {reservations: []};
        fetch('http://localhost:3000/reservation')
            .then(response => response.json())
            .then(reservations => (this.setState({reservations})))
    }
    render(){
        return(
            <div>
                {this.state.reservations.map(record => (
                    <p key={record.recordID}>Start: {record.start_datetime}</p>
                ))}
            </div>
        );
    }
}
ReactDOM.render(
    <Reservations />,
    document.getElementById('root')
);