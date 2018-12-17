import React from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component{
constructor(props){
    super(props);

    this.state = {
        username: '',
        password: '',
        email: '',
        passwordConfirmation:'',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
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

isFormEmpty = ()=>{
    
    if(this.state.username === '' 
        || this.state.email === ''
        || this.state.password === ''
        || this.state.passwordConfirmation === ''){
            
            return true;
    }
}

isPasswordValid = ()=>{
    if(this.state.password.length < 6 || this.state.passwordConfirmation.length < 6){
        return false;
    }else if(this.state.password !== this.state.passwordConfirmation){
        return false;
    }else{
        return true;
    }
};
 
isFormValid = ()=>{
    let errors = [];
    let error;
    if(this.isFormEmpty()){
        error = {message: 'Please fill all the values'};
        this.setState({errors: errors.concat(error)});
        return false;
    }else if(!this.isPasswordValid()) {
        error = {message: 'password is invalid'};
        this.setState({
            errors: errors.concat(error)
        });
        return false;
    }else{
        return true;
    }
}

saveUser = (createdUser)=>{
    return this.state.usersRef.child(createdUser.user.uid).set({
        name: createdUser.user.displayName,
        avatar: createdUser.user.photoURL
    });
};

handleSubmit = (e)=>{
    if(this.isFormValid()){
        e.preventDefault();
        this.setState({
            errors: [],
            loading: true
        });
        firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.password)
        .then(createdUser=>{
            createdUser.user.updateProfile({
                displayName: this.state.username,
                photoURL: `http://gravatar.com/avatar/${md5(this.state.email)}?d=identicon`
            })
            .then(()=>{
                // console.log(createdUser);
               
                this.saveUser(createdUser).then(()=>{
                    this.setState({
                        loading: false
                    });
                });
            }).catch((err)=>{
                this.setState({
                    errors: this.state.errors.concat(err),
                    loading: false
                });
            });
           
        }).catch(err=>{
            console.log(err);
            this.setState({
                errors: this.state.errors.concat(err),
                loading: false
            });
        });
    }
}


displayErrors = (errors)=>{
    return(errors.map((error,i) => <p key={i}>{error.message}</p>));
}
    render(){
        const {username,email,password,passwordConfirmation,errors, loading} = this.state;
        return(
            <Grid textAlign="center" verticalAlign="middle" className="app">   
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h1" icon color="orange" textAlign="center">
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
                                        className={this.handleInputError(errors,'username')}

                            />
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
                            <Form.Input fluid name="passwordConfirmation" 
                                        icon="repeat" 
                                        iconPosition="left" 
                                        placeholder="Password Confirmation"
                                        onChange={this.handleChange}
                                        type="password"
                                        value ={passwordConfirmation}
                                        className={this.handleInputError(errors,'password')}
                            />
                            <Button disabled={loading}
                                    className={loading ? 'loading' : ''} color="orange" fluid size="large"> Submit </Button>
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
                    <Message>Already a user? <Link to="/login" > Login </Link> </Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;