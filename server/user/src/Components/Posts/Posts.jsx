import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axiosRequest";
import { useEffect, useState } from "react";
import axios from "axios";
import Post from "../Post/Post";
import config from "../../config";
import "./Posts.scss";

const Posts = ({ socket, userId }) => 
{
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => 
  {
    const fetchUser = async () => 
    {
      try {
        const res = await axios.get(`${config.apiBaseUrl}users/`+ userId).then((response)=> 
        {
          setUsers(response.data);
          setLoading(false);
        });
      } catch(e){
        console.log(e)
      }
    };
    fetchUser();
  }, [userId]);

  return <div className="posts">
    {loading
        ? "loading"
        : users.messages.map((post) => <Post socket={socket} post={post} key={post.id} id={userId}/>)}
  </div>
};

export default Posts;