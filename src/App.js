import React from "react";
import { Auth, Hub, API, graphqlOperation } from "aws-amplify";
import { getUser } from './graphql/queries';
import { registerUser } from "./graphql/mutations";
import { AmplifyAuthenticator } from '@aws-amplify/ui-react'
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import Navbar from './components/Navbar';
import "./App.css";

import '@aws-amplify/ui/dist/style.css';

export const history = createBrowserHistory();

export const UserContext = React.createContext()

class App extends React.Component {
  state = {
    user: null,
    userAttributes: null
  };

  componentDidMount() {
    this.getUserData();
    Hub.listen('auth', this.listener)
  }

  getUserData = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      user
        ? this.setState({ user }, () => this.getUserAttributes(this.state.user))
        : this.setState({ user: null })
      console.log('getUserData', user)
    } catch (error) {
      console.error('Still not logged in')
    }
    //Otherwise: Uncaught (in promise) not authenticated
  }

  getUserAttributes = async authUserData => {
    const attributesArr = await Auth.userAttributes(authUserData)
    const attributesObj = Auth.attributesToObject(attributesArr)
    this.setState({ userAttributes: attributesObj })
  }

  listener = data => {
    switch (data.payload.event) {
      case "signIn":
        console.log('signed in')
        this.getUserData()
        this.registerNewUser(data.payload.data)
        break;
      case 'signUp':
        console.log('signed up')
        break;
      case 'signOut':
        console.log('signed out')
        this.setState({ user: null })
        break;
      default:
        return;
    }
  }

  registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    }
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput))
    //if we can't get a user (the user hasn't been registered before)
    //then we execute registerUser
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        }
        const newUser = await API.graphql(graphqlOperation(registerUser, { input: registerUserInput }))
        console.log({ newUser })
      } catch (err) {
        console.error("Error registering new user", err)
      }
    }
  }

  handleSignOut = async () => {
    try {
      await Auth.signOut()
    } catch (error) {
      console.log('Error signing out user', error)
    }
  }

  render() {
    const { user, userAttributes } = this.state;

    return !user
      ? (
        <div className='auth-container'>
          <AmplifyAuthenticator />
        </div>
      ) : (
        <UserContext.Provider value={{ user, userAttributes }}>
          <Router history={history}>
            <>
              {/* Navigation */}
              <Navbar user={user} handleSignOut={this.handleSignOut} />

              {/* Routes */}
              <div className="app-container">
                <Route exact path='/' component={HomePage} />
                <Route
                  path='/profile'
                  component={() => <ProfilePage user={user} userAttributes={userAttributes} />} />
                <Route
                  path='/markets/:marketId'
                  component={({ match }) => (
                    <MarketPage user={user} userAttributes={userAttributes} marketId={match.params.marketId} />
                  )
                  }
                />
                {/* <Redirect to='/' /> */}
              </div>
            </>
          </Router>
        </UserContext.Provider>
      )
  }
}

export default App;
