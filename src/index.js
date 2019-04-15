//run with server or default npm start
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';
import Admin from './Admin.js';
import {BrowserRouter as Router, Route, Link, Redirect} from "react-router-dom";
import * as serviceWorker from './serviceWorker';
import EditReservations from "./EditReservations";

ReactDOM.render(
    <Router>
        <Route exact path="/" render={() => (
            <Redirect to="/calendar"/>
        )}/>
        <Route exact path="/calendar" component={App}/>
        <Route path="/myreservations" component={EditReservations}/>
        <Route path="/admin" component={Admin}/>
    </Router>, document.getElementById('root'));
//Testing BigCalendar
//ReactDOM.render(<createCalendar />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
