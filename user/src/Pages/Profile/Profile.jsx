import "./Profile.scss";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../Components/Posts/Posts"
import Share from "../../Components/Share/Share"
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { makeRequest } from "../../axiosRequest";
import Update from "../../Components/Edit/Edit";

const Profile = () => {
  const [openEdit, setOpenEdit] = useState(false);
  const userId = parseInt(useLocation().pathname.split("/")[2]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
      const fetchUser = async () => {
        try{
          const res = await axios.get(`http://localhost:5000/users/`+ userId).then((response)=> {
            setUsers(response.data);
            setLoading(false);
        });
        } catch(e){
          console.log(e)
        }
      };
        fetchUser();
  }, [userId]);

  const { isLoading, error, data } = useQuery(
    ["relationship"],
    () =>
      makeRequest.get(`/users/${currentUser.id}/followers`).then((res) => {
        return res.data;
      })
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (following) => {
      if (following){
        return makeRequest.post(`/users/unfollow/${userId}`, { "userId": currentUser.id });
      }
      return makeRequest.post(`/users/follow/${userId}`, { "userId": currentUser.id  });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["relationship"]);
      },
    }
  );

  const handleFollow = () => {
    mutation.mutate(data.user.following.includes(`${userId}`));
  };


  if (loading) {
    return     <div className="profile">
    <div className="images">
      <img
        src="https://www.inkling.com/wp-content/uploads/2021/06/SD-default-image.png"
        alt=""
        className="cover"
      />
      <img
        src="https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg"
        alt=""
        className="profilePic"
      />
    </div>
    <div className="profileContainer">
      <div className="uInfo">
        <div className="left">
        </div>
        <div className="center">
          <span>username</span>
          <div className="info">
            <div className="item">
              <PlaceIcon />
              <span>USA</span>
            </div>
            <div className="item">
              <LanguageIcon />
              <span>English</span>
            </div>
          </div>
          <button>follow</button>
        </div>
        <div className="right">
          <EmailOutlinedIcon />
          <MoreVertIcon />
        </div>
      </div>
    </div>
  </div>
  }

  return (
    <div className="profile">
      <div className="images">
        <img
          src={users.user.header_image_url}
          alt=""
          className="cover"
        />
        <img
          src={users.user.image_url}
          alt=""
          className="profilePic"
        />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
          </div>
          <div className="center">
            <span>{users.user.username}</span>
            <div className="info">
              <div className="item">
                <PlaceIcon />
                <span>USA</span>
              </div>
              <div className="item">
                <LanguageIcon />
                <span>English</span>
              </div>
            </div>
            {isLoading ? (
                  "loading"
                ) : userId === currentUser.id ? (
                  <button onClick={() => setOpenEdit(true)}>Edit Profile</button>
                ) : (
                  <button onClick={handleFollow}>
                    {data.user.following.includes(`${userId}`)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
          </div>
          <div className="right">
            <EmailOutlinedIcon />
            <MoreVertIcon />
          </div>
        </div>
      <Share/>
      {<Posts userId={users.user.id} />}
      </div>
      {openEdit && <Update setOpenEdit={setOpenEdit} user={users.user}/>}
    </div>
  );
};

export default Profile;