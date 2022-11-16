import React, { useEffect, useState } from 'react';
import "./Conversation.scss";
import axios from "axios";

function Conversations({ conversation, currentUser }) {
    const [users, setUsers] = useState(null);

    useEffect(() => {
      const friendId = conversation.members.find((m) => m !== `${currentUser.id}`);
  
      const getUser = async () => {
        try {
          const res = await axios("http://localhost:5000/users/" + friendId);
          setUsers(res.data);
        } catch (err) {
          console.log(err);
        }
      };
      getUser();
    }, [currentUser, conversation]);
  
    return (
      <div className="conversation">
        <img
          className="conversationImg"
          src={users?.user.image_url}
          alt=""
        />
        <span className="conversationName">{users?.user.username}</span>
      </div>
    );
}

export default Conversations