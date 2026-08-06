import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/ChangePassword.css";

function ChangePassword() {

const [showPassword,setShowPassword] = useState(false);
const [showConfirmPassword,setShowConfirmPassword] = useState(false);

const [formData,setFormData] = useState({
    password:"",
    confirmPassword:""
});

const handleChange=(e)=>{
    setFormData({
        ...formData,
        [e.target.name]:e.target.value
    });
};

const handleSubmit=(e)=>{
    e.preventDefault();

    if(formData.password !== formData.confirmPassword){
        alert("Passwords do not match");
        return;
    }

    console.log("New Password:",formData);

    alert("Password Changed Successfully!");
};

return (
<div className="change-container">

<div className="change-left-panel">

<div className="change-logo">
<h2>Mini CRM</h2>
</div>

<div className="change-hero">

<h1>
Create a new <br/>
secure password
</h1>

<p>
Choose a strong password to keep your CRM account safe and secure.
</p>

</div>

<div className="change-dashboard">

<img 
src={dashboard}
alt="CRM Dashboard"
/>

</div>

<div className="change-team">

<div className="change-avatars">

<img src={avatar1} alt="User"/>
<img src={avatar2} alt="User"/>
<img src={avatar3} alt="User"/>
<img src={avatar4} alt="User"/>

</div>

<div>

<h3>
Trusted by 2,000+ Teams
</h3>

<p>
Helping businesses increase productivity every day.
</p>

</div>

</div>

</div>


<div className="change-right-panel">

<div className="change-form">

<h2>
Reset Password
</h2>

<p>
Create your new password and confirm it below.
</p>


<form onSubmit={handleSubmit}>


<div className="change-input-group">

<label>
New Password
</label>

<div className="password-box">

<input
type={showPassword ? "text":"password"}
name="password"
placeholder="Enter new password"
value={formData.password}
onChange={handleChange}
required
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
>
{
showPassword ? <FaEyeSlash/> : <FaEye/>
}
</button>

</div>

</div>


<div className="change-input-group">

<label>
Confirm Password
</label>

<div className="password-box">

<input
type={showConfirmPassword ? "text":"password"}
name="confirmPassword"
placeholder="Confirm new password"
value={formData.confirmPassword}
onChange={handleChange}
required
/>

<button
type="button"
onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
>
{
showConfirmPassword ? <FaEyeSlash/> : <FaEye/>
}
</button>

</div>

</div>


<button
type="submit"
className="reset-btn"
>
Update Password
</button>


<p className="back-login">

Remember your password?

{" "}

<Link to="/login">
Login
</Link>

</p>


</form>

</div>

</div>

</div>
);

}

export default ChangePassword;