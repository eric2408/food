import React from 'react'
import "./Comment.scss";
import axios from "axios";
import { useState, useEffect } from "react";

function Comment({comment}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
          try{
            const res = await axios.get(`https://foodieland1234.herokuapp.com/users/`+ comment.user_id).then((response)=> {
              setUsers(response.data);
              setLoading(false);
          });
          } catch(e){
            console.log(e)
          }
        };
          fetchUser();
    }, [comment.user_id]);

    if(loading) return <div>loading</div>

    // let commentDate = comment.text.substring(0,8)

  return (
    <div className="comment">
        <img src={users.user.image_url} alt="" />
        <div className="info">
        <span>{users.user.username}</span>
        <p>{comment.text}</p>
        </div>
        <span className="date">
        {comment.timestamp.substring(0,16)}
        </span>
    </div>
  )
}

export default Comment


