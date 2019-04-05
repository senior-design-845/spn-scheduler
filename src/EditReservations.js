import React, {Component} from 'react';
import './EditReservations.css'
import moment from 'moment'

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID : 98,
            buildingID : 1,
            orderBy: 2,
            events : []
        }
    }

    // This is the creation of the list items
    createItem(item) {
        return(
            <EventDropdown event={item} />
        )
    }

    createItems(items) {
        return(
            <div className = 'dd-list-wrapper'>
                    {items.map(this.createItem)}
            </div>
        );
    }

    getReservations() {
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
                orderBy: this.state.orderBy,
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
                        recurring_recordID: record.recurring_recordID,
                        room_name: record.room_name,
                    });
                    return null;
                });

                this.setState({events: events});
            });
    }

    componentDidMount(){
        this.getReservations();
    }

    render() {
        return(this.createItems(this.state.events));
    }
}

class EventDropdown extends Component {
    constructor(props) {
        super(props);

        let currentEvent = this.props.event;

        let rawDateStart = String(currentEvent.start_datetime);
        let rawDateEnd = String(currentEvent.end_datetime);

        let dateObjectStart = this.convertDate(rawDateStart);
        let dateObjectEnd = this.convertDate(rawDateEnd);

        moment.locale('en');
        let startDate = moment(dateObjectStart).format('LLL');
        let endDate = moment(dateObjectEnd).format('LT');

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);

        this.state = {
            title: this.props.event.title,
            description: this.props.event.event_detail,
            startDate: startDate,
            endDate: endDate,
            room_name: this.props.event.room_name,
            roomID: this.props.event.roomID,
        }
    }

    showDDContent(event){
        event.preventDefault();

        this.setState({showDDContent: true}, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }

    closeDDContent(event){
        if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    convertDate(rawDate) {
        let rawDateSplit = rawDate.split(/[- :T]/);
        let t = rawDateSplit.map(item => parseInt(item, 10));

        return (new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5])));
    }

    render() {
        return(
            <div className='dd-list-container'>
                <div className = 'dd-list-header' onClick={this.showDDContent}>
                    <div className = 'event-room'>
                        Room: {this.state.room_name}
                    </div>
                    <div className = 'event-date'>
                        Date: {this.state.startDate} - {this.state.endDate}
                    </div>
                    <div className = 'event-title'>
                        Title: {this.state.title}
                    </div>
                </div>
                {
                    this.state.showDDContent ? (
                        <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>

                            <ul className = 'dd-list-items'>
                                <li>Description: {this.state.description}</li>
                            </ul>
                            <button className = 'dd-edit-button'>EDIT</button>

                        </div>
                    ) : ( null )
                }
            </div>
        );
    }
}

export default EditReservations;