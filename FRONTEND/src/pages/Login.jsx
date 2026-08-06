import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";


import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";


import "../styles/Login.css";



function Login() {


  const [showPassword,setShowPassword] = useState(false);



  const [formData,setFormData] = useState({

    email:"",
    password:""

  });



  const handleChange=(e)=>{

    setFormData({

      ...formData,

      [e.target.name]:e.target.value

    });

  };




  const handleSubmit=(e)=>{

    e.preventDefault();


    console.log("Login Data:",formData);


  };




  return (

<div className="container-main">



{/* ================= LEFT PANEL ================= */}


<div className="left-panel">


<div className="logo">

<h2>Mini CRM</h2>

</div>





<div className="hero-content">


<h1>

Manage your sales <br/>

pipeline like a pro

</h1>


<p>

Track leads, close deals, and grow your business with a modern CRM
designed for growing teams.

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


<img src={avatar1} alt="User 1"/>

<img src={avatar2} alt="User 2"/>

<img src={avatar3} alt="User 3"/>

<img src={avatar4} alt="User 4"/>


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

Welcome Back

</h2>



<p>

Login to your account and continue managing your sales efficiently.

</p>







<form onSubmit={handleSubmit}>


{/* EMAIL */}



<div className="input-group">


<label>

Email Address

</label>



<input

type="email"

name="email"

placeholder="Enter your email"

value={formData.email}

onChange={handleChange}

required

/>



</div>








{/* PASSWORD */}



<div className="input-group">


<label>

Password

</label>




<div className="password-box">



<input

type={showPassword ? "text":"password"}

name="password"

placeholder="Enter your password"

value={formData.password}

onChange={handleChange}

required

/>






<button

type="button"

onClick={()=>setShowPassword(!showPassword)}

>

{

showPassword 

?

<FaEyeSlash/>

:

<FaEye/>

}


</button>




</div>



</div>







{/* OPTIONS */}



<div className="login-options">



<label>


<input type="checkbox"/>


Remember Me


</label>




<Link 
to="/forgot-password"
className="forgot-btn"
>

Forgot Password?

</Link>



</div>







<button

type="submit"

className="register-btn"

>

Login

</button>







<p className="login-link">


Don't have an account?


{" "}


<Link to="/register">

Register

</Link>



</p>




</form>




</div>


</div>





</div>


  );

}



export default Login;