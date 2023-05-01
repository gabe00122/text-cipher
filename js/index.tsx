import React from "react";
import ReactDOM from "react-dom/client" 
import App from "./App";

console.log(document.getElementById("root"));
console.log(ReactDOM);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>
);
