import React from 'react'
import {Link} from 'react-router-dom'

export default function ToperH() {
  return (
    <div>
        <nav className=' Toper'>
            <ul className='nav'>
                <li className='nav-item'>
                    <Link className='nav-link text-primary' to={'/FindDShop'}>Find a Dive Shop</Link>
                </li>
                <div className='dropdown'>
                    <li className='nav-item dropdown'>
                    <a className='nav-link dropdown-toggle text-primary' href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        SIGN-IN
                    </a>
                    <ul className='dropdown-menu' aria-labelledby="navbarDropdown">
                        <li>
                            <Link className='dropdown-item text-primary' to={'/SignIn'}>Sign-Up</Link>
                        </li>
                        <li>
                            <Link className='dropdown-item text-primary' to={'/Login'}>Log-In</Link>
                        </li>
                    </ul>
                    </li>
                </div>
            </ul>
        </nav>
    </div>
  )
}
