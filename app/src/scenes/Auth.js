import React, { useEffect, useState } from "react";
import firebaseapp from "./base.js";
import { getUser } from "../components/UserUtils"

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pending, setPending] = useState(true);

  useEffect(async() => {

    firebaseapp.auth().onAuthStateChanged((user) => {
      //console.log('Response from onAuthStateChanged :: ' + JSON.stringify(user))
      setCurrentUser(user)
      setPending(false)
    });

  }, []);

  if(pending){
    return <>Loading...</>
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
