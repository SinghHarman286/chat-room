import "./App.css";

import { useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Wrapper from "./components/Wrapper/Wrapper";

import CustomLandingPage from "./pages/CustomLandingPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ChatRoomPage from "./pages/ChatRoomPage";

import UserProfile from "./pages/UserProfile";

import AuthContext from "./store/auth-context";

function App() {
  const authContext = useContext(AuthContext);
  const isLoggedIn = authContext.isLoggedIn;

  return (
    <div className="App">
      <Wrapper>
        <Switch>
          <Route path="/" exact>
            {!isLoggedIn ? <CustomLandingPage /> : <HomePage />}
          </Route>
          {!isLoggedIn && (
            <Route exact path="/auth">
              <AuthPage />
            </Route>
          )}
          <Route exact path="/profile">
            {isLoggedIn && <UserProfile />}
            {!isLoggedIn && <Redirect to="/auth" />}
          </Route>
          {isLoggedIn && (
            <Route exact path="/rooms/:id">
              <ChatRoomPage />
            </Route>
          )}
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Wrapper>
    </div>
  );
}

export default App;
