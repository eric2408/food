import "./Messenger.scss";
import Conversations from "../../Components/Conversations/Conversations";
import Message from "../../Components/Message/Message";
import OnlineChat from "../../Components/OnlineChat/OnlineChat";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";
import io from "socket.io-client";
import MobileChat from "../../Components/mobileChat/mobileChat";

export default function Messenger() {
  const [conversations, setConversations] = useState([]);
  let allConvo = [];
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();
  const { currentUser } = useContext(AuthContext);
  const scrollRef = useRef();
  const [count, setCount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userss, setUserss] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    const isMobile = width <= 480;

    useEffect(() => {
        const fetchUser = async () => {
          try{
            const res = await axios.get(`https://foodieland1234.herokuapp.com/users/`+ currentUser.id).then((response)=> {
              setUserss(response.data);
              setIsFollowing(response.data.user.following)
              setIsLoading(false);
          });
          } catch(e){
            console.log(e)
          }
        };
          fetchUser();
    }, [currentUser.id]);
  



  useEffect(() => {
    socket.current = io("https://foodieland1234.herokuapp.com/");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, [messages]);


  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(`${arrivalMessage.sender}`) &&
      setMessages((prev) =>[...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  
  useEffect(() => {
    socket.current.emit("addUser", currentUser.id);
    if(!isLoading){
      socket.current.on("getUsers", (users) => {
        setOnlineUsers(
          isFollowing.filter((f) => users.some((u) => `${u.userId}` === f))
        );
      });
    }
  }, [currentUser.id, isLoading]);


  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("https://foodieland1234.herokuapp.com/conversation/" + currentUser.id);
        allConvo = []
        res.data.convo.map(chat => chat.members.includes(`${currentUser.id}`)? allConvo.push(chat): "")
        setConversations(allConvo)
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [currentUser.id]);


  useEffect(() => {
    const getMessages = async () => {
      if(count > 0){
        try {
            setLoading(true)
            const res = await axios.get(`https://foodieland1234.herokuapp.com/letters/${currentChat?.id}`).then((response)=> {
                setMessages(response.data.letters);
                setLoading(false);
            });
      } catch (err) {
        console.log(err);
      }
    };
      }    
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      conversationId: currentChat.id,
      sender: currentUser.id,
      text: newMessage,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== `${currentUser.id}`
    );


    socket.current.emit("sendMessage", {
      senderId: currentUser.id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("https://foodieland1234.herokuapp.com/letters", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentChat]);


  const handleNotification = (type) => {
    const receiver = currentChat.members.find(
      (member) => member !== `${currentUser.id}`
    );

    socket.current.emit("send", {
      sender: currentUser.username,
      receiverId: receiver,
      type,
    });
  };


  if(loading || isLoading) return <>loading</>

  if(isMobile){
    return (
      <>
        <div className="messenger">
          {currentChat && count > 1? <></>: <div className="chatMenu">
            <div className="chatMenuWrapper">
              <h2 className="chatHead">Chats</h2>
              {conversations.map((c) => (
                <div onClick={() => {setCurrentChat(c); setCount(count +1);}}>
                  <Conversations conversation={c} currentUser={currentUser} />
                </div>
              ))}
            </div>
          </div>}
          {currentChat && count > 1?<MobileChat currentchat={currentChat} count={count} scrollref={scrollRef} messages={messages} currentuser={currentUser} setnewmessage={setNewMessage} newmessage={newMessage} handlesubmit={handleSubmit} handlenotification={handleNotification}/>:
          <></>}
          {currentChat && count > 1? <></>: <div className="chatOnline">
            <div className="chatOnlineWrapper">
            <h2 className="chatHeadTwo">Active Followers</h2>
            {onlineUsers.map((u) => (
              <OnlineChat
                onlineUser={u}
                currentId={currentUser.id}
                setCurrentChat={setCurrentChat}
              />
              ))}  
            </div>
          </div>}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <h2 className="chatHead">Chats</h2>
            {conversations.map((c) => (
              <div onClick={() => {setCurrentChat(c); setCount(count +1);}}>
                <Conversations conversation={c} currentUser={currentUser} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat && count > 1? (
              <>
                <div className="chatBoxTop">
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.sender === `${currentUser.id}`} />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="write something here"
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button className="chatSubmitButton" onClick={(e) => {handleSubmit(e); handleNotification(3);}}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Start chatting with your Foodie!
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
          <h2 className="chatHeadTwo">Active Followers</h2>
          {onlineUsers.map((u) => (
            <OnlineChat
              onlineUser={u}
              currentId={currentUser.id}
              setCurrentChat={setCurrentChat}
            />
            ))}  
          </div>
        </div>
      </div>
    </>
  );
}