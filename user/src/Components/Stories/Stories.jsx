import "./Stories.scss";
import { AuthContext } from "../../Context/AuthContext";
import { useContext } from "react";
import { useEffect, useState } from "react";
import axios from "axios";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState(null);
  const [isLoading, setLoading] = useState(true);

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
}, [currentUser.id]);

  if(isLoading) return <div>Loading</div>

  const stories = [
    {
      id: 1,
      name: "kwilliams",
      img: "https://images.pexels.com/photos/13916254/pexels-photo-13916254.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
    },
    {
      id: 2,
      name: "becklinda",
      img: "Pictures/Posts/12.png",
    },
    {
      id: 3,
      name: "Sarah",
      img: "Pictures/Posts/13.png",
    },
    {
      id: 4,
      name: "Joseph",
      img: "Pictures/Posts/14.png",
    },
  ];

  return (
    <div className="stories">
      <div className="story">
          <img src={users.user.image_url} alt="" />
          <span>{users.user.username}</span>
          <button>+</button>
        </div>
      {stories.map(story=>(
        <div className="story" key={story.id} style={{ cursor: "pointer" }}>
          <img src={story.img} alt="" />
          <span>{story.name}</span>
        </div>
      ))}
    </div>
  )
}

export default Stories