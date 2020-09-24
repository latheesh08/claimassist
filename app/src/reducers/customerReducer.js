import { STORE_CUSTOMER_INFO, CLEAR_CUSTOMER_INFO } from "../constants/actionTypes";

const initialState = {
    customerInfo: {}
};

export default function customerReducer(state = initialState, action) {
    switch (action.type) {
        case STORE_CUSTOMER_INFO:
            console.log("STORE CUSTOMER INFO REDUX");
            console.log(action);
            return {
                ...state,
                customerInfo: action.customerInfo
            };
        case CLEAR_CUSTOMER_INFO:
            return {
                ...state,
                customerInfo: {},
            };
        default:
            return state;
    }
}
