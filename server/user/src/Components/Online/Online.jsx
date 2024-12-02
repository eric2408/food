import React from 'react'
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../../config";

function Online({user})
{
  const [users, setUsers] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => 
  {
    const fetchUser = async () => 
    {
      try {
        const res = await axios.get(`${config.apiBaseUrl}users/`+ user).then((response)=>
        {
          setUsers(response.data);
          setLoading(false);
        });
      } catch(e){
        console.log(e)
      }
    };
    fetchUser();
  }, [user.id]);

  if(isLoading) return <div>Loading</div>

  return (
  <div className="user">
    <div className="userInfo">
      <img
        src={users.user.image_url}
        alt=""
      />
      <div className="online" />
      <Link
        to={`/profile/${users.user.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
      <span>{users.user.username}</span>
      </Link>
    </div>
  </div>
  )
}

export default Online;



