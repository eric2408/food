import { Link } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Badge } from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import config from "../../config";
import { DarkModeContext } from "../../Context/DarkMode";
import { AuthContext } from "../../Context/AuthContext";
import "./Navbar.scss";

const Navbar = ({ socket }) => 
{
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [openTwo, setOpenTwo] = useState(false);
  const { logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [info, setInfo] = useState([]);
  const [loadingTwo, setLoadingTwo] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [openThree, setOpenThree] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [openFour, setOpenFour] = useState(false);

  function handleWindowSizeChange() 
  {
    setWidth(window.innerWidth);
  }

  useEffect(() => 
  {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => 
      {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);
  
  const isMobile = width <= 480;

  useEffect(() => 
  {
    const fetchUser = async () => 
    {
      try {
        const res = await axios.get(`${config.apiBaseUrl}users/`+ currentUser.id).then((response)=> 
        {
          setUsers(response.data);
          setLoading(false);
        });
      } catch(e){
        console.log(e)
      }
    };
    fetchUser();
  }, []);

  useEffect(() => 
  {
    const fetchData = async () => {
      try{
        const res = await axios.get(`${config.apiBaseUrl}users?q=${query}`).then((response)=> {
          setInfo(response.data);
          setLoadingTwo(false);
      });
      } catch(e){
        console.log(e)
      }
    };
    if (query.length > 1) fetchData();
  }, [query]);
  
  useEffect(() => 
  {
    if (socket.current) 
    {
      console.log(socket.current)
      socket.current.on("getNotification", (data) => 
      {
        console.log("data: ", data);
        data.receiverId === currentUser.id && setNotifications((prev) => [...prev, data]);
      });
  
      socket.current.on("get", (data) => 
      {
        console.log("data: ", data);
        data.receiverId === `${currentUser.id}` && setNotifications((prev) => [...prev, data]);
      });
    }
    
  }, [socket]);

  const displayNotification = ({ sender, receiverId, type }) => 
  {
    let action;

    if (type === 1) 
    {
      action = "liked";
      return (
        <span className="notification">{`${sender} ${action} your post.`}</span>
      );
    } else if (type === 2){
      action = "commented";
      return (
        <span className="notification">{`${sender} ${action} on your post.`}</span>
      );
    } else {
      action = "sent";
      return (
        <span className="notification">{`${sender} ${action} you a message.`}</span>
      );
    }
  };

  const handleRead = () => 
  {
    setNotifications([]);
    setOpenThree(false);
  };

  if(loading) return <div>loading</div>

  if(isMobile && openFour)
  {
    return (
      <div className="navbar">
        <div className="left">
          <div className="search mobile">
          <input className="search mobile" type="text" placeholder="Search..." onChange={(e) => setQuery(e.target.value.toLowerCase())} />
            <SearchOutlinedIcon style={{ cursor: "pointer" }} onClick={() => setOpenTwo(!openTwo)} />
          </div>
        </div>
        <div className="searchContent mobile">
            <div className="contain mobile">{!loadingTwo && openTwo ? info.users.map((item) => (
                    <div className="down" key={item.id}>
                        <img
                            src={item.image_url}
                            alt=""
                          />
                        <Link style={{textDecoration: 'none'}} to={'/profile/'+item.id}>
                          <div className="name">{item.username}</div>
                        </Link>
                    </div>
                )):""}
            </div>
          </div>  
          <div><KeyboardReturnIcon style={{ cursor: "pointer"}} onClick={() => setOpenFour(false)}/></div>
      </div>
    );
  };
  
  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }} >
          <img src={`/Pictures/Foodieland.png`} alt="" />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon style={{ cursor: "pointer" }} onClick={toggle}/>
        ) : (
          <DarkModeOutlinedIcon style={{ cursor: "pointer" }} onClick={toggle}/>
        )}
        <div className="grid"></div>
        <div className="search">
        <input className="search" type="text" placeholder="Search..." onChange={(e) => setQuery(e.target.value.toLowerCase())} />
          <SearchOutlinedIcon style={{ cursor: "pointer" }} onClick={() => {setOpenTwo(!openTwo); setOpenFour(true);}} />
        </div>
      </div>
      <div className="searchContent">
          <div className="contain">{!loadingTwo && openTwo ? info.users.map((item) => (
                  <div className="down" key={item.id}>
                      <img
                          src={item.image_url}
                          alt=""
                        />
                      <Link style={{textDecoration: 'none'}} to={'/profile/'+item.id}>
                        <div className="name">{item.username}</div>
                      </Link>
                  </div>
              )):""}
          </div>
        </div>  
      <div className="right">
        {darkMode ? (
                 <Link style={{textDecoration: 'none', color:'white', cursor: "pointer"}} to="/convo/chat">
                   <EmailOutlinedIcon />
                 </Link>
        ) : (
          <Link style={{textDecoration: 'none', color:'black', cursor: "pointer"}} to="/convo/chat">
            <EmailOutlinedIcon />
          </Link>
        )}
        <div className="notification">
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsOutlinedIcon style={{ cursor: "pointer" }} onClick={() => setOpenThree(!openThree)}/>
          </Badge>
        </div>
        {openThree && (
        <div className="notifications">
          {notifications.map((n) => displayNotification(n))}
          <button className="nButton" onClick={handleRead}>
            Mark as read
          </button>
        </div>
      )}
        <div className="user">
          {currentUser ? open ? <div className="dropdown" onClick={() => setOpen(!open)}>
            <img
              src={users.user.image_url}
              alt=""
            /> 
              <div className="dropmenu">
                Welcome {currentUser?.username} 
                <Link 
                  to={`/profile/${currentUser?.id}`} 
                  style={{ textDecoration: 'none' }}
                  className="pro"
                >
                  <div style={{ display: 'flex', alignItems: 'center', color: darkMode ? 'white' : 'black' }}>
                    <ManageAccountsIcon style={{ marginRight: 10 }} />
                    PROFILE
                  </div>
                </Link>
                <div className="sign"onClick={() => logout()}>SIGN OUT</div>
              </div>
            </div> : <div className="dropdown" onClick={() => setOpen(!open)}>
            <img
              src={users.user.image_url}
              alt=""
            />
            </div>
            : <div className="menu">REGISTER</div>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;