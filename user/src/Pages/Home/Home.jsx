import Stories from "../../Components/Stories/Stories"
import Posts from "../../Components/Posts/Posts"
import Share from "../../Components/Share/Share"
import "./Home.scss";
import { AuthContext } from "../../Context/AuthContext";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axiosRequest";
import Post from "../../Components/Post/Post";

const Home = ({ socket }) => {
  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery(["postss"], () =>
  makeRequest.get(`/${currentUser.id}`).then((res) => {
    return res.data;
  })
  );



  return (
    <div className="home">
      <Stories />
      <Share />
      <div className="posts">
        {error
          ? "Something went wrong!"
          : isLoading
          ? "loading"
          : data.messages.map((post) => <Post socket={socket} post={post} key={post.id} id={post.user_id}/>)}
      </div>
    </div>
  )
}

export default Home