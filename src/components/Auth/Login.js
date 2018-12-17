import React from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Login extends React.Component{
constructor(props){
    super(props);

    this.state = {
        
        password: '',
        email: '',
        
        errors: [],
        loading: false
        
    };
}
handleChange = (e)=>{
    e.preventDefault();
    // console.log(e.target.name);
    this.setState({
        [e.target.name] : e.target.value
    });
}

handleInputError = (errors,inputName)=>{
    return errors.some(error => error.message.toLowerCase().includes(inputName) )? "error" : '';
}

handleSubmit = (e)=>{
    if(this.isFormValid(this.state)){
        e.preventDefault();
        this.setState({
            errors: [],
            loading: true
        });
        firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password)
        .then(signedInUser=>{
            console.log(signedInUser);
            this.setState({
                loading: false
            });
        }).catch(err=>{
            this.setState({
                errors: this.state.errors.concat(err),
                loading: false
            });
        });
    }
}

isFormValid = ({email,password}) => email && password;

displayErrors = (errors)=>{
    return(errors.map((error,i) => <p key={i}>{error.message}</p>));
}
    render(){
        const {email,password,errors,loading} = this.state;
        return(
            <Grid textAlign="center" verticalAlign="middle" className="app">   
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet"> </Icon>
                        Login
                    </Header>
                    <Form size="large"  onSubmit={this.handleSubmit}>
                        <Segment stacked>
                           <Form.Input fluid name="email" 
                                        icon="mail" 
                                        iconPosition="left" 
                                        placeholder="Email Address"
                                        onChange={this.handleChange}
                                        type="email"
                                        value={email}
                                        className={this.handleInputError(errors,'email')}
                            />
                            <Form.Input fluid name="password" 
                                        icon="lock" 
                                        iconPosition="left" 
                                        placeholder="Password"
                                        onChange={this.handleChange}
                                        type="password"
                                        value={password}
                                        className={this.handleInputError(errors,'password')}
                            />
                            <Button disabled={loading}
                                    className={loading ? 'loading' : ''} color="violet" fluid size="large"> Submit </Button>
                        </Segment>
                    </Form>
                    {
                        this.state.errors.length > 0 && 
                        //error prop is given to provide error styling 
                        <Message error>   
                            <h3>Error</h3>
                            {this.displayErrors(this.state.errors)}
                        </Message>
                    }
                    <Message>Don't have an account? <Link to="/register" > Register Here </Link> </Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Login;