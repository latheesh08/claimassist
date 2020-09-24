import resources from "./resources";

var userLang = navigator.language || navigator.userLanguage; 
var lng = "en";
if(userLang.includes("es")){
  lng = "es";
}else if(userLang.includes("ja")){
  lng = "ja";
}

console.log ("The browser language is: " + userLang);

export const config = {
  interpolation: { escapeValue: false },
  lng: lng,
  resources
};

export { resources };
