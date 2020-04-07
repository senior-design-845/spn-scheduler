import React, {Component} from "react";
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-dropdown';
import "./Login.css"
import {Redirect} from "react-router";


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
            buildingIDs: [],
            buildingNames: [],
            redirect: false
        }
        
        this.handleLogin = this.handleLogin.bind(this);
        this.handleBuildings = this.handleBuildings.bind(this);
    }

    validateForm(){
        return this.state.netid.length > 0;
    }

    handleChange = event => {
        this.setState({
            [event.target.id]:event.target.value
        });
    };

    

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
                                
                            });

                        });
                        this.setState({redirect: true});
                }
            });

    };

    render(){
        return(
            <div>
			    
                <div className = 'page-title'>Login</div>
                <div className="Login">
                <div class="image"></div>  
                    <Form onSubmit={this.handleLogin}>
                    
                        <label for= "netid">NetID: </label>
                        <Form.Group controlId="netid" bsSize="large">
                        
                            <Form.Control
                                autoFocus
                                type="netid"
                                value={this.state.netid}
                                onChange={this.handleChange}
                            />
                            
                           
                    </Form.Group>
					
                        <button class = "button" id="submit" type="submit">
                            Login
                        </button>
						
                    </Form>
                    {
                        this.state.showBuildings ? (
                            <Dropdown options={this.state.buildingNames} onChange={this.handleBuildings} value={this.state.selectedBuilding}/>
                        ) : null
                    }
					
					
                    {
                        this.state.redirect ? (
                            <Redirect to={{
                                pathname: '/calendar',
                                state: {
                                    buildingID: 1,
                                    userID: this.state.userid,
                                    classID: this.state.classID,
                                    email: this.state.email
                                }}}/>
                        ) : null
                    }
					<div className = 'page-footer'>Unauthorized use is prohibited. Usage may be subject to security testing and monitoring. Misuse is subject to criminal prosecution. No expectation of privacy except as otherwise provided by applicable privacy laws.
					</div>
                </div>
                
            </div>
        );
    }
}

export default Login;