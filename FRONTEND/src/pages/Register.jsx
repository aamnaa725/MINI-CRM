import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

import dashboard from "../../assets/dashboard.png";
import avatar1 from "../../assets/1.png";
import avatar2 from "../../assets/2.png";
import avatar3 from "../../assets/3.png";
import avatar4 from "../../assets/4.png";

import "../styles/Register.css";


function Register() {


  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [formData, setFormData] = useState({

    FullName: "",
    EmailAddress: "",
    PhoneNumber: "",
    Password: ""
  });



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  async function CreateUserData(userData) {
    try {
      const response = await fetch('http://127.0.0.1:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // Tells the server to expect JSON
        },
        body: JSON.stringify(userData)
      });

      // Always check if the response status is OK (200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON data
      console.log(data);
    } catch (error) {
      console.error('Fetch failed:', error.message);
    }
  }





  const handleSubmit = (e) => {

    e.preventDefault();


    if (formData.password !== formData.confirmPassword) {

      alert("Passwords do not match");

      return;

    }

    CreateUserData(formData)


  };



  return (

    <div className="container-main">


      {/* LEFT PANEL */}

      <div className="left-panel">


        <div className="logo">

          <h2>Mini CRM</h2>

        </div>



        <div className="hero-content">

          <h1>
            Manage your sales <br />
            pipeline like a pro
          </h1>


          <p>
            Track leads, close deals, and grow your business with a modern CRM
            designed for growing teams.
          </p>


        </div>




        <div className="dashboard">

          <img src={dashboard} alt="Dashboard" />

        </div>




        <div className="trusted-teams">


          <div className="avatars">

            <img src={avatar1} alt="user" />
            <img src={avatar2} alt="user" />
            <img src={avatar3} alt="user" />
            <img src={avatar4} alt="user" />

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




      {/* RIGHT PANEL */}


      <div className="right-panel">


        <div className="form-container">


          <h2>Create your Account</h2>


          <p>
            Join thousands of businesses managing their sales efficiently.
          </p>

          <form onSubmit={handleSubmit}>


            <div className="input-group">

              <label>Full Name</label>

              <input

                type="text"

                name="fullName"

                placeholder="Enter your full name"

                value={formData.fullName}

                onChange={handleChange}

                required

              />

            </div>




            <div className="input-group">

              <label>Email Address</label>


              <input

                type="email"

                name="email"

                placeholder="Enter your email"

                value={formData.email}

                onChange={handleChange}

                required

              />


            </div>





            <div className="input-group">

              <label>Phone Number</label>


              <input

                type="tel"

                name="phone"

                placeholder="+92 300 1234567"

                value={formData.phone}

                onChange={handleChange}

                required

              />


            </div>






            <div className="input-group">


              <label>Password</label>


              <div className="password-box">


                <input

                  type={showPassword ? "text" : "password"}

                  name="password"

                  placeholder="Create password"

                  value={formData.password}

                  onChange={handleChange}

                  required

                />



                <button

                  type="button"

                  onClick={() => setShowPassword(!showPassword)}

                >

                  {
                    showPassword ? <FaEyeSlash /> : <FaEye />
                  }


                </button>


              </div>
            </div>

            <div className="input-group">


              <label>Confirm Password</label>


              <div className="password-box">


                <input

                  type={showConfirmPassword ? "text" : "password"}

                  name="confirmPassword"

                  placeholder="Confirm password"

                  value={formData.confirmPassword}

                  onChange={handleChange}

                  required

                />




                <button

                  type="button"

                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}

                >

                  {
                    showConfirmPassword ? <FaEyeSlash /> : <FaEye />
                  }


                </button>


              </div>


            </div>

            <button
              type="submit"
              className="register-btn"
            >
              Create Account
            </button>


            <p className="login-link">

              Already have an account?

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


export default Register;