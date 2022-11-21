import Post from "../Post/Post";
import "./Posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axiosRequest";

const Posts = ({userId}) => {
    const { isLoading, error, data } = useQuery(["posts"], () =>
    makeRequest.get("/users/"+userId).then((res) => {
      return res.data;
    })
    );



  return <div className="posts">
    {error
        ? "Something went wrong!"
        : isLoading
        ? "loading"
        : data.messages.map((post) => <Post post={post} key={post.id} id={userId}/>)}
  </div>;
};

export default Posts;