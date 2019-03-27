import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./Reservations.css";

class Reservations extends Component {
    constructor(props){
        super(props);
        this.state={
            showRoomMenu: false,
            startDate: new Date()
        }

        this.showRoomMenu = this.showRoomMenu.bind(this);
        this.closeRoomMenu = this.closeRoomMenu.bind(this);
        this.handleChange = this.handleChange.bind(this);
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

    handleChange(date){
        this.setState({ startDate: date });
    }


    render(){
        return(
            <div>
                <div className="dropdown">
                <button class="dropbtn" onClick={this.showRoomMenu}>
                    Show Rooms
                </button>

                {
                    this.state.showRoomMenu ? (
                        <div className="dropdown-content"
                            ref={(element) => {
                                this.dropdownMenu = element;
                            }}
                        >
                           <button> Room 1</button>
                           <button> Room 2</button>
                           <button> Room 3</button>
                        </div>
                    ) : ( null )
                }
                </div>
                <br/><br/><br/>
                <DatePicker
                    selected={this.state.startDate}
                    onChange={this.handleChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    timeCaption="Start"
                />
            </div>
        );
    }
}

export default Reservations;