import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";


import "../styles/ForgotPassword.css";



function ForgotPassword() {


  const navigate = useNavigate();



  const [email,setEmail] = useState("");



  const handleSubmit = (e)=>{

    e.preventDefault();



    console.log("Forgot Password Email:", {

      email: email

    });



    alert("Password reset link sent successfully!");



    navigate("/reset-password");


  };



  return (


<div className="container-main">



{/* ================= LEFT PANEL ================= */}


<div className="left-panel">



<div className="logo">

<h2>
Mini CRM
</h2>

</div>





<div className="hero-content">


<h1>

Reset your <br/>
password easily

</h1>



<p>

Enter your registered email address and we will help you recover your account.

</p>


</div>






<div className="dashboard">


<img 

src={dashboard}

alt="CRM Dashboard"

/>


</div>







<div className="trusted-teams">


<div className="avatars">


<img src={avatar1} alt="User"/>

<img src={avatar2} alt="User"/>

<img src={avatar3} alt="User"/>

<img src={avatar4} alt="User"/>


</div>




<div className="team-text">


<h3>

Trusted by 2,000+ Teams

</h3>


<p>

Helping businesses increase productivity every day.

</p>


</div>



</div>



</div>







{/* ================= RIGHT PANEL ================= */}



<div className="right-panel">



<div className="form-container">



<h2>

Forgot Password?

</h2>




<p>

Enter your email address to receive a password reset link.

</p>







<form onSubmit={handleSubmit}>


<div className="input-group">


<label>

Email Address

</label>




<input


type="email"

name="email"

placeholder="Enter your email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

required


/>


</div>








<button

type="submit"

className="register-btn"

>

Reset Password

</button>







<p className="login-link">


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



export default ForgotPassword;