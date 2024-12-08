import "./Comments.scss";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axiosRequest";
import axios from "axios";
import Comment from "../Comment/Comment";
import config from "../../config";

const Comments = ({ handleNotification, postId }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try{
        const res = await axios.get(`${config.apiBaseUrl}users/`+ currentUser.id).then((response)=> {
          setUsers(response.data);
          setLoading(false);
      });
      } catch(e){
        console.log(e)
      }
    };
      fetchUser();
}, [currentUser.id]);


  const { isLoading, error, data } = useQuery(["comments"], () =>
    makeRequest.get(`messages/${postId}/comments`).then((res) => {
      return res.data;
    })
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newComment) => {
      return makeRequest.post(`/messages/${postId}/comments`, newComment);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments"]);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ "text": desc, "userId": currentUser.id });
    setDesc("");
  };

  if(loading) return <div>loading</div>

  
  return (
      <div className="comments">
        <div className="write">
          <img src={users.user.image_url} alt="" />
          <input
            type="text"
            placeholder="write a comment"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button onClick={(e) => {handleClick(e); handleNotification(2);}}>Submit</button>
        </div>
        {error
          ? "Something went wrong"
          : isLoading
          ? "loading"
          : data.comments.length > 0 && data.comments.map((comment) => (
              <Comment comment={comment}/>
            ))
          }
      </div>
    );


};

export default Comments;