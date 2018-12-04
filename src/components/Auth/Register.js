import React from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Register extends React.Component{
constructor(props){
    super(props);

    this.state = {
        username: '',
        password: '',
        email: '',
        passwordConfirmation:'',
        errors: []
    };
}
handleChange = (e)=>{
    e.preventDefault();
    // console.log(e.target.name);
    this.setState({
        [e.target.name] : e.target.value
    });
}

isFormEmpty = ()=>{
    if(this.state.username !== '' 
        || this.state.email !== ''
        || this.state.password !== ''
        || this.state.passwordConfirmation !== ''){
            return true;
    }
}

isPasswordValid = ()=>{
    
};
 
isFormValid = ()=>{
    let errors = [];
    let error;
    if(this.isFormEmpty()){
        error = {message: 'Please fill all the values'};
        this.setState({errors: errors.concat(error)});
        return false;
    }else if(!this.isPasswordValid()) {

    }else{
        return true;
    }
}

handleSubmit = (e)=>{
    if(this.isFormValid()){
        e.preventDefault();
        firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.password)
        .then(createdUSer=>{
            console.log(createdUSer);
        }).catch(err=>{
            console.log(err);
        });
    }
}

    render(){
        const {username,email,password,passwordConfirmation} = this.state;
        return(
            <Grid textAlign="center" verticalAlign="middle" className="app">   
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h2" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece"> </Icon>
                        Register
                    </Header>
                    <Form size="large"  onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input fluid name="username" 
                                        icon="users" 
                                        iconPosition="left" 
                                        placeholder="username"
                                        onChange={this.handleChange}
                                        type="text"
                                        value={username}

                            />
                            <Form.Input fluid name="email" 
                                        icon="mail" 
                                        iconPosition="left" 
                                        placeholder="Email Address"
                                        onChange={this.handleChange}
                                        type="email"
                                        value={email}
                            />
                            <Form.Input fluid name="password" 
                                        icon="lock" 
                                        iconPosition="left" 
                                        placeholder="Password"
                                        onChange={this.handleChange}
                                        type="password"
                                        value={password}
                            />
                            <Form.Input fluid name="passwordConfirmation" 
                                        icon="repeat" 
                                        iconPosition="left" 
                                        placeholder="Password Confirmation"
                                        onChange={this.handleChange}
                                        type="password"
                                        value ={passwordConfirmation}
                            />
                            <Button color="orange" fluid size="large"> Submit </Button>
                        </Segment>
                        <Message>Already a user? <Link to="/login" > Login </Link> </Message>
                    </Form>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;