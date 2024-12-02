import React from 'react'
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import Online from "../../Components/Online/Online";
import config from "../../config";
import "./Followers.scss";

function Followers() 
{
  const [users, setUsers] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const userId = parseInt(useLocation().pathname.split("/")[2]);
  const navigate = useNavigate();

  useEffect(() => 
  {
    const fetchUser = async () => 
    {
      try {
        const res = await axios.get(`${config.apiBaseUrl}users/${userId}/followers`).then((response)=> 
        {
          setUsers(response.data);
          setLoading(false);
        });
      } catch(e){
        console.log(e)
      }
    };
    fetchUser(); 
  }, []);

  const handleClick = () => 
  {
    navigate(`/profile/${userId}`)
  }

  if (isLoading) 
  {
    return <>loading...</>
  }

  return (
    <div className='containerrr'>
        <div><KeyboardReturnIcon style={{ cursor: "pointer", 'margin-top': 10, 'margin-bottom': 10 }} onClick={() => handleClick()}/></div>
        <div className="itemmm">
            <span>Online Friends</span>
            {users.user.followers.length > 0 && users.user.followers.map((u) => (
            <Online key={u.id} user={u} />
            ))}
        </div>
    </div>
  )
}

export default Followers