import React from 'react';
import "./Message.scss";
import { format } from "timeago.js";
import { useEffect, useState } from "react";
import axios from "axios";

function Message({ message, own }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getMessages = async () => {
          if(!own){
            try {
                const res = await axios.get(`http://localhost:5000/users/${parseInt(message.sender)}`).then((response)=> {
                    setUsers(response.data);
                    setLoading(false)
                });

          } catch (err) {
            console.log(err);
          }
        };
          }    
        getMessages();
      }, []);

    if (loading && !own) return <>loading</>

    return (
        <div className={own ? "message own" : "message"}>
          <div className="messageTop">
            {own ? <></>:<img
              className="messageImg"
              src={users?.user.image_url}
              alt=""
            />}
            <p className="messageText">{message.text}</p>
          </div>
          <div className="messageBottom">{format(message.timestamp)}</div>
        </div>
      );
}

export default Message