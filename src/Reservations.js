import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./Reservations.css";

class Reservations extends Component {
    constructor(props){
        super(props);
        this.state={
            showRoomMenu: false,
            startDate: new Date(),
            endDate: new Date(),
            selectedRoom: 'Select Room'
        }

        this.showRoomMenu = this.showRoomMenu.bind(this);
        this.closeRoomMenu = this.closeRoomMenu.bind(this);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleDropdown = this.handleDropdown.bind(this);
    }

    showRoomMenu(event){
        event.preventDefault();

        this.setState({showRoomMenu: true}, () => {
            document.addEventListener('click', this.closeRoomMenu);
        });
    }

    closeRoomMenu(event){
        if(!this.dropdownMenu.contains(event.target)){
            this.setState({showRoomMenu: false}, () => {
                document.removeEventListener('click', this.closeRoomMenu);
            });
        }
    }

    handleStartChange(date){
        this.setState({ startDate: date });
    }
    handleEndChange(date){
        this.setState({ endDate: date});
    }

    handleDropdown(i){
        this.setState({selectedRoom: this.props.uniqueRooms[i].title})
    }


    render(){
        return(
            <div>
                <div className="dropdown">
                <button class="dropbtn" onClick={this.showRoomMenu}>
                    {this.state.selectedRoom}
                </button>

                {
                    this.state.showRoomMenu ? (
                        <div className="dropdown-content"
                            ref={(element) => {
                                this.dropdownMenu = element;
                            }}
                        >
                            {this.props.uniqueRooms.map((e) => (
                                <button onClick={() => this.handleDropdown(e.id) }>
                                    {e.title}
                                </button>
                            ))}
                        </div>
                    ) : ( null )
                }
                </div>
                <br/><br/><br/>
                <DatePicker
                    selected={this.state.startDate}
                    onChange={this.handleStartChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    timeCaption="Start"
                />
                <br/><br/>
                <DatePicker
                    selected={this.state.endDate}
                    onChange={this.handleEndChange}
                    showTimeSelect
                    showTimeSelectOnly
                    minTime={this.state.startDate.getTime()}
                    maxTime={this.state.startDate.getTime()}
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="h:mm aa"
                    timeCaption="End"
                />
                <br/>
            </div>
        );
    }
}

export default Reservations;