import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faGoogle,
  faInstagram,
  faLinkedin,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

export default function AppFooter() {
  return (
    <footer className="footer text-center text-lg-start text-white">
      <section className="d-flex justify-content-between p-4" id="section">
        <div className="me-5">
          <span>Get connected with us on social media:</span>
        </div>
        <div>
          <a href="" className="text-white me-4">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="" className="text-white me-4">
            <FontAwesomeIcon icon={faTwitter}></FontAwesomeIcon>
          </a>
          <a href="" className="text-white me-4">
            <FontAwesomeIcon icon={faGoogle}></FontAwesomeIcon>
          </a>
          <a href="" className="text-white me-4">
            <FontAwesomeIcon icon={faInstagram}></FontAwesomeIcon>
          </a>
          <a href="" className="text-white me-4">
            <FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon>
          </a>
          <a href="" className="text-white me-4">
            <FontAwesomeIcon icon={faGithub}></FontAwesomeIcon>
          </a>
        </div>
      </section>
      <section className="">
        <div className="container-fluid">
          <div className="row mt-3">
            <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold">Eco Dive</h6>
              <hr className="hrline mb-4 mt-0 d-inline-block mx-auto" />
              <p>
                Here you can use rows and columns to organize your footer
                content. Lorem ipsum dolor sit amet, consectetur adipisicing
                elit.
              </p>
            </div>

            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold">Products</h6>
              <hr className="hrline mb-4 mt-0 d-inline-block mx-auto" />
              <p>
                <a href="#!" className="text-white">
                  MDBootstrap
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  MDWordPress
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  BrandFlow
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  Bootstrap Angular
                </a>
              </p>
            </div>

            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold">Products</h6>
              <hr className="hrline mb-4 mt-0 d-inline-block mx-auto" />
              <p>
                <a href="#!" className="text-white">
                  MDBootstrap
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  MDWordPress
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  BrandFlow
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  Bootstrap Angular
                </a>
              </p>
            </div>

            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold">Useful links</h6>
              <hr className="hrline mb-4 mt-0 d-inline-block mx-auto" />
              <p>
                <a href="#!" className="text-white">
                  Your Account
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  Become an Affiliate
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  Shipping Rates
                </a>
              </p>
              <p>
                <a href="#!" className="text-white">
                  Help
                </a>
              </p>
            </div>

            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
              <h6 className="text-uppercase fw-bold">Contact</h6>
              <hr className="hrline mb-4 mt-0 d-inline-block mx-auto" />

              <p>
                <i className="fas fa-home mr-3"></i> Tel Aviv, Israel
              </p>
              <p>
                <i className="fas fa-envelope mr-3"></i> info@example.com
              </p>
              <p>
                <i className="fas fa-phone mr-3"></i>+972-3-1233456
              </p>
              <p>
                <i className="fas fa-print mr-3"></i>+972-52-000000
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="copyright text-center p-3">
        {" "}
        © 2023 Copyright Made With Love By:
        <a className="text-white"> Nadav KT</a>
      </div>
    </footer>
  );
}
