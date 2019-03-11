import React, {Component} from 'react';

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
    render(){
        return(
            <div>
                {this.state.reservations.map(record => (
                    <p>Start: {record.start_datetime}   End: {record.end_datetime}</p>
                ))}
            </div>
        );
    }
}

export default Reservations;
