import React, { UserState } from 'react'
import { useContext } from "react"
import { CartContext } from '../Context/CartContext';

export default function SignIn() {
  const { users } = useContext(CartContext)
  // let users = getUsers()
  // alert(UsersData);
  // async function getUsers() {
  //   let res = await fetch('/Data/Users.json');
  //   let data = await res.json();
  //   return data
  const handleSubmit = (event) => {
    event.preventDefault();
    let formData = new FormData(event.target)
    let user = {}
    for (const pair of formData.entries()) {
      user[pair[0]] = pair[1]
    }
    users.push(user)
    // let data = new FormData(event.target)
    // user =
    // {
    //   img: data.get('img') | "",
    //   firstN: data.get('firstN') | "",
    //   LastN: data.get('LastN') | "",
    //   Email: data.get('Email') | "",
    //   Bday: data.get('Bday') | "",
    //   city: data.get('city') | "",
    //   street: data.get('street') | "",
    //   streetN: data.get('streetN') | "",
    //   password: data.get('password') | ""

    // }
    // const first_name = data.get('firstName')
    // const last_name = data.get('lastName')

    // console.log(event.target[0].value)
  }

  console.log('Test')
  // }

  return (
    <div className='Sign-in-page'>
      <form onSubmit={handleSubmit}>
        <h3>Sign Up</h3>
        <div className="mb-3">
          <label>First name</label>
          <input type="text" name="firstN" className="sign-in-line form-control" placeholder="First name" />
        </div>
        <div className="mb-3">
          <label>Last name</label>
          <input type="text" name="lastN" className="sign-in-line form-control" placeholder="Last name" />
        </div>
        <div className="mb-3">
          <label>Email address</label>
          <input type="email" name="Email" className="sign-in-line form-control" placeholder="Enter email" />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" name="password" className="sign-in-line form-control" placeholder="Enter password" />
        </div>
        <div className="mb-3">
          <label>Re-Password</label>
          <input type="password" name="password" className="sign-in-line form-control" placeholder='Re-password' />
        </div>
        <div className="mb-3">
          <label>Birth Date</label>
          <input type="date" name="Bday" className="sign-in-line form-control" />
        </div>
        <div className="mb-3">
          <label>City</label>
          <input type="text" name="city" className="sign-in-line form-control" placeholder="Enter your city" />
        </div>
        <div className="mb-3">
          <label>Address</label>
          <input type="text" name="street" className="sign-in-line form-control" placeholder="Enter your street" />
        </div>
        <div className="mb-3">
          <label>Number</label>
          <input type="number" name="streetN" className="sign-in-line form-control" placeholder="Enter your street number" />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </div>
        <p className="forgot-password text-right">
          Already registered <a href="/Login">Log-In?</a>
        </p>
      </form>
    </div>
  )
}





