import React, {Component} from "react";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap";
import Dropdown from 'react-dropdown';
import Bootstrap from "react-bootstrap";
import "./Login.css"
import Auth from "aws-amplify";


class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            netid:''
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    validateForm(){
        return this.state.netid.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]:event.target.value
        });
    }

    handleSubmit = event => {
        event.preventDefault();

        fetch('/login', {
            method: 'POST',
            headers: {
                'Accept': "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                netid: this.state.netid,
            })
        }).then(response => response.json())
            .then(text => {

                console.log(text)
            })

    }

    render(){
        return(
            <div className="Login">
            <Form onSubmit={this.handleSubmit}>
                <Form.Group controlId="netid" bsSize="large">
                    <Form.Control
                        autoFocus
                        type="netid"
                        value={this.state.netid}
                        onChange={this.handleChange}
                    />
                </Form.Group>
                <button
                    block
                    bssize="large"
                    disabled={!this.validateForm()}
                    type="submit"
                >
                    Login
                </button>
            </Form>
            </div>
        );
    }
}

export default Login;