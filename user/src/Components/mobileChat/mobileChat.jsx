import React from 'react'
import Message from "../Message/Message";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

function MobileChat({currentchat,count,scrollref, messages,currentuser, setnewmessage,newmessage,handlesubmit,handlenotification}) {
  
  const handleClick = () => {
    window.location.reload();
  }

  return (
    <div className="chatBox">
    <div className="chatBoxWrapper">
      {currentchat && count > 1? (
        <>
          <div><KeyboardReturnIcon style={{ cursor: "pointer", 'margin-top': 10 }} onClick={() => handleClick()}/></div>
          <div className="chatBoxTop">
            {messages.map((m) => (
              <div ref={scrollref}>
                <Message message={m} own={m.sender === `${currentuser.id}`} />
              </div>
            ))}
          </div>
          <div className="chatBoxBottom">
            <textarea
              className="chatMessageInput"
              placeholder="write something here"
              onChange={(e) => setnewmessage(e.target.value)}
              value={newmessage}
            ></textarea>
            <button className="chatSubmitButton" onClick={(e) => {handlesubmit(e); handlenotification(3);}}>
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
  )
}

export default MobileChat