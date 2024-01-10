import React from 'react'
import { useState } from 'react';

const users = [{ email: 'avi@gmail.com', password: '123' }]

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === 'admin@admin.com' && password === '123456789') {
      // log in as admin
      setUser({ email, isAdmin: true })
      return
    }

    const user = users.find(u => u.email === email && u.password === password)
    if (!user) {
      alert('oops something is wrong, please check your inputs !')
    }
    setUser({ email: user.email, isAdmin: false })
  }

  return (
    <div className='Sign-in-page'>
      <form onSubmit={handleSubmit}>
        <h3>Log-In</h3>
        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            className="sign-in-line form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="sign-in-line form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}

          />
        </div>
        <div className="mb-3">
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customCheck1"
            />
            <label className="custom-control-label" htmlFor="customCheck1">
              Remember me
            </label>
          </div>
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
        <p className="forgot-password text-right">
          Forgot <a href="#">password?</a>
        </p>
      </form>
    </div>
  )
}
