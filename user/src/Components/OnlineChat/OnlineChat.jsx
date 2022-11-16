import axios from "axios";
import React, { useEffect, useState } from "react";
import "./OnlineChat.scss";

function OnlineChat({ onlineUser, currentId, setCurrentChat }) {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let allConvo = [];


  useEffect(() => {
    const getFriends = async () => {
      const res = await axios.get(`http://localhost:5000/users/${onlineUser}`).then(response => {
          setFriends(response.data.user)
        });

    };

    getFriends();
    setIsLoading(false);
  }, [currentId, onlineUser]);



  

  const handleClick = async (user) => {

  };

  if(isLoading) return <>loading</>

  return (
    <div className="chatOnline">
        <div className="chatOnlineFriend" onClick={() => handleClick(friends)}>
          <div className="chatOnlineImgContainer">
            <img
              className="chatOnlineImg"
              src={friends?.image_url}
              alt=""
            />
            <div className="chatOnlineBadge"></div>
          </div>
          <span className="chatOnlineName">{friends?.username}</span>
        </div>
    </div>
  );
}

export default OnlineChat