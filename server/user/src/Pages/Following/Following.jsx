import React from 'react'
import { AuthContext } from "../../Context/AuthContext";
import { useContext, useEffect, useState } from "react";
import Online from "../../Components/Online/Online";
import axios from "axios";
import "./Following.scss";
import { useLocation, useNavigate } from "react-router-dom";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

function Followering() {
    const [users, setUsers] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const { currentUser } = useContext(AuthContext);
    const userId = parseInt(useLocation().pathname.split("/")[2]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
          try{
            const res = await axios.get(`https://foodieland1234.herokuapp.com/users/${userId}/followers`).then((response)=> {
              setUsers(response.data);
              setLoading(false);
          });
          } catch(e){
            console.log(e)
          }
        };
          fetchUser(); 
    }, []);

    const handleClick = () => {
        navigate(`/profile/${userId}`)
    }

    if (isLoading) {
        return <>loading...</>
    }

  return (
        <div className='containerrr'>
            <div><KeyboardReturnIcon style={{ cursor: "pointer", 'margin-top': 10, 'margin-bottom': 10 }} onClick={() => handleClick()}/></div>
            <div className="itemmm">
                <span>Online Friends</span>
                {users.user.following.length > 0 && users.user.following.map((u) => (
                <Online key={u.id} user={u} />
                ))}
            </div>
        </div>
  )
}

export default Followering