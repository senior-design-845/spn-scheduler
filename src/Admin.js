import React, {Component} from 'react';
import './Admin.css'
import {Link} from "react-router-dom";


class Admin extends Component {

    render() {
        return(
        <div>
            <style>
                {document.body.style = 'background: #43a047;'}
            </style>
            <div id = 'routing-table'>
                <Link id="link" to="/calendar">Calendar</Link>
                <br/>
                <Link id="link" to="/myreservations">My Reservations</Link>
            </div>
            <div className = 'page-title'>Administrator Actions</div>
            <div id='input-forms'>
                <div className = 'input-data' id = 'add-user'>
                    <div id = 'add-user-title'>Add User:</div>
                    <form>
                        <label>
                            First Name:
                            <input type = 'text'/>
                        </label>
                        <label>
                            Last Name:
                            <input type = 'text'/>
                        </label>
                        <label>
                            Net ID:
                            <input type = 'text'/>
                        </label>
                        <label>
                            Email:
                            <input type = 'text'/>
                        </label>
                        <label>
                            Project Number:
                            <input type = 'text'/>
                        </label>
                        <label>
                            Course:
                            <input type = 'text'/>
                        </label>
                        <label>
                            Classification (i.e. Student, Staff, Admin):
                            <input type = 'text'/>
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
                <div className = 'input-data' id = 'add-user'>
                    <div id = 'edit-user-title'>Edit/Remove User:</div>
                    <form>
                        <label>
                            Net ID:
                            <input type = 'text'/>
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            </div>
        </div>
        )
    }
}

export default Admin;