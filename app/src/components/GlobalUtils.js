
import queryString from 'query-string'

export const checkQueryStrings = () => {
    const values = queryString.parse(window.location.search);
    console.log("QUERY STRING VALUES");
    console.log(values);
    return values;
};