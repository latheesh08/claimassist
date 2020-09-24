import i18next from "i18next";
// import { initReactI18next } from "react-i18next";
// import resources from "./translations/resources";
import { config as i18nextConfig } from "./translations";

// i18next.init({
//   fallbackLng: "en",
//   //   lng: "en",
//   debug: true,
//   interpolation: {
//     escapeValue: false
//   },
//   resources: resources
//   //   resources
// });

i18next.init(i18nextConfig);

export default i18next;
