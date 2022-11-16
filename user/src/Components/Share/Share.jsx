import "./Share.scss";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import TagIcon from '@mui/icons-material/Tag';
import { AuthContext } from "../../Context/AuthContext";
import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axiosRequest";
import app from "../../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Share = () => {

  const { currentUser } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");

  const upload = async () => {

      const fileName = new Date().getTime() + file.name;
      const storage = getStorage(app);
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          // Handle unsuccessful uploads
          reject(error)
        }, 
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImg(downloadURL);
            resolve(downloadURL)
          });
        }
      );
      })
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newPost) => {
      return makeRequest.post(`/messages/${currentUser.id}/new`, newPost);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );


  const handleClick = async (e) => {
    e.preventDefault();
    if(file){
      const url = await upload();
      mutation.mutate({ "text": desc, "images": url});
    }
    setDesc("");
    setFile(null);
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            <img
              src={"https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg"}
              alt=""
            />
            <input type="text" 
              placeholder={`What's on your mind ${currentUser.username}?`} 
              onChange={(e) => setDesc(e.target.value)}
              value={desc}/>
          </div> 
          <div className="right">
            {file && (
                <img className="file" alt="" src={URL.createObjectURL(file)} />
              )}
          </div>       
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input type="file" id="file" style={{display:"none"}} onChange={(e) => setFile(e.target.files[0])}/>
            <label htmlFor="file">
              <div className="item">
                <CameraAltIcon />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item">
              <AddLocationAltIcon />
              <span>Add Place</span>
            </div>
            <div className="item">
              <TagIcon />
              <span>Tag Friends</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleClick}>Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;