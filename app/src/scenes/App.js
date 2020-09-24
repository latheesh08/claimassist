import React, { Component } from "react";


import "./App.scss";

// Notification
import { SnackbarProvider } from "notistack";

// Translation
import i18next from "i18next";
import { I18nextProvider } from "react-i18next";

// Redux
import { createStore, applyMiddleware } from "redux";
import rootReducer from "../reducers";
import { Provider , connect } from "react-redux";
import thunk from "redux-thunk";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import MainRouter from './MainRouter'

const persistConfig = {
  key: "claimassist_storage",
  storage
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, undefined, applyMiddleware(thunk));
const persistor = persistStore(store);

class App extends Component {


  render() {
    return (
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <I18nextProvider i18n={i18next}>
              <MainRouter />
            </I18nextProvider>
          </PersistGate>
        </Provider>
      </SnackbarProvider>
    );
  }
}


export default App;
