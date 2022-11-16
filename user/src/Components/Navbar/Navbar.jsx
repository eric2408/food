import "./Navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { DarkModeContext } from "../../Context/DarkMode";
import { AuthContext } from "../../Context/AuthContext";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import axios from "axios";
import { useEffect } from "react";
import { Badge } from '@mui/material';

const Navbar = () => {
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


  useEffect(() => {
    const fetchUser = async () => {
      try{
        const res = await axios.get(`http://localhost:5000/users/`+ currentUser.id).then((response)=> {
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
    const fetchData = async () => {
      try{
        const res = await axios.get(`http://localhost:5000/users?q=${query}`).then((response)=> {
          setInfo(response.data);
          setLoadingTwo(false);
      });
      } catch(e){
        console.log(e)
      }
    };
    if (query.length > 1) fetchData();
  }, [query]);

  if(loading) return <div>loading</div>


  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }} >
          <img src={'http://localhost:3000/Pictures/Foodieland.png'} alt="" />
        </Link>
        <HomeOutlinedIcon />
        {darkMode ? (
          <WbSunnyOutlinedIcon style={{ cursor: "pointer" }} onClick={toggle}/>
        ) : (
          <DarkModeOutlinedIcon style={{ cursor: "pointer" }} onClick={toggle}/>
        )}
        <GridViewOutlinedIcon />
        <div className="search">
          <SearchOutlinedIcon />
          <input className="search" type="text" placeholder="Search..." onChange={(e) => setQuery(e.target.value.toLowerCase())} onClick={() => setOpenTwo(!openTwo)}/>
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
        <Badge badgeContent={1} color="error">
        {darkMode ? (
                 <Link style={{textDecoration: 'none', color:'white'}} to="/convo/chat">
                   <EmailOutlinedIcon />
                 </Link>
        ) : (
          <Link style={{textDecoration: 'none', color:'black'}} to="/convo/chat">
            <EmailOutlinedIcon />
          </Link>
        )}
 
        </Badge>
        <Badge badgeContent={2} color="error">
          <NotificationsOutlinedIcon />
        </Badge>

        <div className="user">
                            {currentUser ? open ? <div className="dropdown" onClick={() => setOpen(!open)}>
                              <img
                              src={users.user.image_url}
                              alt=""
                              /> 
                                <div className="dropmenu">
                                Welcome {currentUser?.username} 
                                  <div className="pro">
                                    <ManageAccountsIcon style={{'marginRight': 10}}/>
                                    <Link style={{textDecoration: 'none', color: 'white'}} to={'/profile/'+currentUser?.id}>PROFILE</Link>
                                  </div>
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