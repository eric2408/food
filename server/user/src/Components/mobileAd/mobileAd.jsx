import React from 'react'
import "./mobileAd.scss";
import config from "../../config";

function MobileAd() {
  return (
    <div className="containerr">
        <div className="itemm">
        <span>Sponsored</span>
            <div className="userr">
                <img
                src={`/Pictures/Ad.png`}
                alt=""
                />
            </div>
        </div>
    </div>
  )
}

export default MobileAd