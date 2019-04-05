import React, {Component} from 'react';
import './EditReservations.css'
import moment from 'moment'

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID : 897,
            buildingID : 1,
            orderBy: 1,
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
        return(items.map(this.createItem));
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
        return(
            <div>
                <div className = 'dd-list-wrapper'>
                    {this.createItems(this.state.events)}
                </div>
            </div>
        );
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
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);

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
            if (!this.state.ddEditClick)
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

    ddEditClick(event) {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick(event) {
        this.setState({showDDContent: true, ddEditClick: false}, () => {
            document.addEventListener('click', this.closeDDContent);
        });
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

                            <div className = 'dd-list-items'>
                                Description: {this.state.description}
                            </div>
                            {
                                !this.state.ddEditClick ? (
                                    <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                ) : (
                                    <form onSubmit={this.handleSubmit}>
                                        <label>
                                            Name:
                                            <input type="text" value={this.state.value} onChange={this.handleChange} />
                                        </label>
                                        <input type="submit" value="Submit" />
                                        <button className = 'dd-cancel-button' onClick={this.ddCancelClick}>CANCEL</button>
                                    </form>
                                )
                            }

                        </div>
                    ) : ( null )
                }
            </div>
        );
    }
}

export default EditReservations;