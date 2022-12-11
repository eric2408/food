import "./Post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link} from "react-router-dom";
import Comments from "../Comments/Comments";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axiosRequest";
import axios from "axios";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";

const Post = ({ socket, post, id }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState([]);
  const [commentLoading, setCommentLoading] = useState(true);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
      const fetchUser = async () => {
        try{
          const res = await axios.get(`https://foodieland1234.herokuapp.com/users/`+ id).then((response)=> {
            setUsers(response.data);
            setLoading(false);
        });
        } catch(e){
          console.log(e)
        }
      };
        fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchComment = async () => {
      try{
        const res = await axios.get(`https://foodieland1234.herokuapp.com/messages/${post.id}/comments`).then((response)=> {
          setComment(response.data);
          setCommentLoading(false);
      });
      } catch(e){
        console.log(e)
      }
    };
      fetchComment();
}, []);

  const { isLoading, error, data } = useQuery(["likes", post.id], () =>
  makeRequest.get(`/messages/${post.id}/like`).then((res) => {
  return res.data;
})
);

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (liked) => {
      if (liked) return makeRequest.post(`/messages/${post.id}/deleteLike`, { "userId": `${currentUser.id}` });
      return makeRequest.post(`/messages/${post.id}/like`, { "userId": `${currentUser.id}` });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["likes"]);
      },
    }
  );

  const deleteMutation = useMutation(
    (postId) => {
      return makeRequest.post(`/messages/${postId}/delete`, { "userId": `${id}` });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"]);
        window.location.reload();
      },
    }
  );

  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id));
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
  };



  const handleNotification = (type) => {
    socket.current.emit("sendNotification", {
      sender: currentUser.username,
      receiverId: users.user.id,
      type,
    });
  };

  if(loading) return <div>loading</div>
  if(commentLoading) return <div>loading</div>
  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={users.user.image_url} alt="" />
            <div className="details">
              <Link
                to={`/profile/${users.user.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{users.user.username}</span>
              </Link>
              <span className="date">{post.timestamp.substring(0,16)}</span>
            </div>
          </div>
            <MoreHorizIcon style={{ cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)} />
            {menuOpen && post.user_id === currentUser.id && (
              <button onClick={handleDelete}>Delete Post</button>
            )}
        </div>
        <div className="content">
          <p>{post.text}</p>
          <img src={post.imageUrl} alt="" />
        </div>
        <div className="info">
          <div className="item">
            {isLoading ? (
                "loading"
              ) : data.includes(currentUser.id) ? (
                <FavoriteOutlinedIcon
                  style={{ color: "red" }}
                  onClick={handleLike}
                />
              ) : (
                <FavoriteBorderOutlinedIcon onClick={() => {handleLike(); handleNotification(1);}} />
              )}
              {data?.length} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {comment.comments.length} {comment.comments.length > 1 ? <>Comments</> : <>Comment</>}
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments handleNotification={handleNotification} postId={post.id}/>}
      </div>
    </div>
  );
};

export default Post;