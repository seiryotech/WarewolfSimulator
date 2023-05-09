import Example from "./module.js";
import "./style.css";

{/* <script type="text/babel"> */ }
const appEl = document.querySelector("#app");
const root = ReactDOM.createRoot(appEl);
root.render(<Example />);
// </script>

