import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";


function App() {

return (

<BrowserRouter>

<Routes>

<Route path="/login" element={<Login/>}/>

<Route path="/" element={<Register/>}/>

<Route path="/forgot-password" element={<ForgotPassword/>}/>

<Route path="/reset-password" element={<ChangePassword/>}/>

</Routes>

</BrowserRouter>

);

}


export default App;