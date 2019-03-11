//run with server or default npm start
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App.js'
import Reservations from './reactTest.js'
import * as serviceWorker from './serviceWorker';

//Changed App to Reservations for testing
ReactDOM.render(<Reservations />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
