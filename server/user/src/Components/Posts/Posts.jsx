import Post from "../Post/Post";
import "./Posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axiosRequest";
import { useEffect, useState } from "react";
import axios from "axios";

const Posts = ({userId}) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchUser = async () => {
        try{
          const res = await axios.get(`https://foodieland1234.herokuapp.com/users/`+ userId).then((response)=> {
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
        : users.messages.map((post) => <Post post={post} key={post.id} id={userId}/>)}
  </div>;
};

export default Posts;