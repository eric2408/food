import "./RightBar.scss";
import Online from "../Online/Online";
import { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { Link } from "react-router-dom";

const RightBar = () => {

  const [users, setUsers] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [usersTwo, setUsersTwo] = useState(null);
  const [isLoadingTwo, setLoadingTwo] = useState(true);
  const [usersThree, setUsersThree] = useState(null);
  const [isLoadingThree, setLoadingThree] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try{
        const res = await axios.get(`https://foodieland1234.herokuapp.com/users/${currentUser.id}/followers`).then((response)=> {
          setUsers(response.data);
          setLoading(false);
      });
      } catch(e){
        console.log(e)
      }
    };
      fetchUser();
}, []);

useEffect(() => {
  const fetchUser = async () => {
    try{
      const res = await axios.get(`https://foodieland1234.herokuapp.com/users/${22}`).then((response)=> {
        setUsersTwo(response.data);
        setLoadingTwo(false);
    });
    } catch(e){
      console.log(e)
    }
  };
    fetchUser();
}, []);

useEffect(() => {
  const fetchUser = async () => {
    try{
      const res = await axios.get(`https://foodieland1234.herokuapp.com/users/${142}`).then((response)=> {
        setUsersThree(response.data);
        setLoadingThree(false);
    });
    } catch(e){
      console.log(e)
    }
  };
    fetchUser();
}, []);

if (isLoading || isLoadingTwo || isLoadingThree) {
  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg"
                alt=""
              />
              <span>Joe</span>
            </div>
            <div className="buttons">
              <button>follow</button>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg"
                alt=""
              />
              <span>Joe</span>
            </div>
            <div className="buttons">
              <button>follow</button>
            </div>
          </div>
        </div>
        <div className="item">
        <span>Sponsored</span>
          <div className="user">
              <img
                src="https://foodieland1234.herokuapp.com/Pictures/Ad.png"
                alt=""
              />
          </div>
        </div>
        <div className="item">
          <span>Online Friends</span>
        </div>
      </div>
    </div>
  ); 
}

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          <div className="user">
            <div className="userInfo">
              <img
                src={usersTwo.user.image_url}
                alt=""
              />
              <Link
                to={`/profile/${usersTwo.user.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span>{usersTwo.user.username}</span>
              </Link>
            </div>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src={usersThree.user.image_url}
                alt=""
              />
              <Link
                to={`/profile/${usersThree.user.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span>{usersThree.user.username}</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="item">
          <span>Sponsored</span>
          <div className="user">
              <img
                src="https://foodieland1234.herokuapp.com/Pictures/Ad.png"
                alt=""
              />
          </div>
        </div>
        <div className="item">
          <span>Online Friends</span>
          {users.user.following.length > 0 && users.user.following.map((u) => (
            <Online key={u.id} user={u} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightBar;