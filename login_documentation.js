import React, {Component} from "react";
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-dropdown';
import "./Login.css"
import {Redirect} from "react-router";

//login class that contains values and necessary functions to handle login and submitting
class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            netid:'',
            userid: 0,
            classID: 0,
            selectedBuilding: 'Please select a building',
            buildingID:0,
            showBuildings: false,
            showSubmit: false,
            buildingIDs: [],
            buildingNames: [],
            redirect: false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleBuildings = this.handleBuildings.bind(this);
    }

    //function that checks if the netid is of valid length (>0)
    validateForm(){
        return this.state.netid.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]:event.target.value
        });
    };

    handleSubmit(){
        this.setState({redirect: true});
    }

	
    handleBuildings(selected){
        let id = 0;
        for(let i=0; i<this.state.buildingNames.length; i++)
            if(this.state.buildingNames[i] === selected.value)
                id = this.state.buildingIDs[i];
        this.setState({selectedBuilding: selected.value, buildingID: id, showSubmit: true});
    }

    handleLogin = event => {
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
        }).then(response => {
            try{
                return response.json()
            }
            catch{
                alert("Invalid Server Response")
            }
        })
			//Shows a popup box alert when the user inputs an invalid user name in the prompt.
            .then(text => {
                if(text.length === 0)
                    alert("Invalid Username");
                else {
                    console.log(text[0]);
                    this.setState({
                        userid: text[0].userID,
                        classID: text[0].classID,
                        email: text[0].email
                    });
					
					//check if the received building is one of the allowed buildings, which should only be SPN
                    fetch('/getBuildings', {
                        method: 'POST',
                        headers: {
                            'Accept': "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userID: text[0].userID
                        })
                    }).then(response => response.json())
                        .then(record => {

                            let buildingNames = [];
                            let buildingIDs = [];
                            record.map(building =>{
                                buildingNames.push(building.building_name);
                                buildingIDs.push(building.buildingID);
                            });

                            this.setState({
                                buildingNames: buildingNames,
                                buildingIDs: buildingIDs,
                                showBuildings: true
                            });

                        });
                }
            });

    };

	//render() provides visuals such as the "Login" for the user
    render(){
        return(
            <div>
			
				//The "Login" sign on the top left [Note: This is subject for removal]
                <div className = 'page-title'>Login</div>
                <div className="Login">
				
					//The document style is for the background. The image itself is hosted by UTD.
                    <style>
						{document.body.style = 'background: url(https://idp.utdallas.edu/idp/images/background1.png) no-repeat top center;'}
					</style>
					
					//checks if the submit is a netid to allows access to the room reservation page
                    <Form onSubmit={this.handleLogin}>
                        <Form.Group controlId="netid" bsSize="large">
                            <Form.Control
                                autoFocus
                                type="netid"
                                value={this.state.netid}
                                onChange={this.handleChange}
                            />
                    </Form.Group>
					
						//the button class goes into the .css files to grab the specifications for the submit "Login" button
                        <button class = "button" id="submit" type="submit">
                            Login
                        </button>
						
					//Once the student logs in-
					//It will prompt the student to choose a building via dropdown box.
                    </Form>
                    {
                        this.state.showBuildings ? (
                            <Dropdown options={this.state.buildingNames} onChange={this.handleBuildings} value={this.state.selectedBuilding}/>
                        ) : null
                    }
					
					//Once the student chooses a building, then it will pop up a button that says "Submit."
                    {
                        this.state.showSubmit ? (
                            <button onClick={this.handleSubmit}>Submit</button>
                        ) : null
                    }
					
					//Moves to the next page after confirming that their information is correct.
                    {
                        this.state.redirect ? (
                            <Redirect to={{
                                pathname: '/calendar',
                                state: {
                                    buildingID: this.state.buildingID,
                                    userID: this.state.userid,
                                    classID: this.state.classID,
                                    email: this.state.email
                                }}}/>
                        ) : null
                    }
					
					//Copyright footer. Same as the login page for eLearning.
					<div className = 'page-footer'>Unauthorized use is prohibited. Usage may be subject to security testing and monitoring. Misuse is subject to criminal prosecution. No expectation of privacy except as otherwise provided by applicable privacy laws.
					</div>
                </div>
            </div>
        );
    }
}

export default Login;