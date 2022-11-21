import { useState } from "react";
import { makeRequest } from "../../axiosRequest";
import "./Edit.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import app from "../../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";

const Edit = ({ setOpenEdit, user }) => {
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [texts, setTexts] = useState({
    email: user.email,
    username: user.username
  });
  const { currentUser } = useContext(AuthContext);


  const upload = async () => {

    const fileName = new Date().getTime() + profile.name;
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, profile);

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
          setProfile(downloadURL);
          resolve(downloadURL)
        });
      }
    );
    })
    };

    const uploadC = async () => {

        const fileName = new Date().getTime() + cover.name;
        const storage = getStorage(app);
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, cover);
    
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
              setCover(downloadURL);
              resolve(downloadURL)
            });
          }
        );
        })
        };


  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (user) => {
      return makeRequest.post(`/users/${currentUser.id}/update`, user);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["user"]);
        window.location.reload();
      },
    }
  );


  const handleClick = async (e) => {
    e.preventDefault();
    
    let coverUrl;
    let profileUrl;
    coverUrl = cover ? await uploadC() : user.header_image_url;
    profileUrl = profile ? await upload() : user.image_url;

    mutation.mutate({ ...texts, "header_image_url": coverUrl, "image_url": profileUrl });

    setOpenEdit(false);
    setCover(null);
    setProfile(null);
  }
  
  return (
    <div className="update">
      <div className="wrapper">
        <h1>Update Your Profile</h1>
        <form>
          <div className="files">
            <label htmlFor="cover">
              <span>Cover Picture</span>
              <div className="imgContainer">
                <img
                  src={
                    cover
                      ? URL.createObjectURL(cover)
                      : user.header_image_url
                  }
                  alt=""
                />
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              type="file"
              id="cover"
              style={{ display: "none" }}
              onChange={(e) => setCover(e.target.files[0])}
            />
            <label htmlFor="profile">
              <span>Profile Picture</span>
              <div className="imgContainer">
                <img
                  src={
                    profile
                      ? URL.createObjectURL(profile)
                      : user.image_url
                  }
                  alt=""
                />
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              type="file"
              id="profile"
              style={{ display: "none" }}
              onChange={(e) => setProfile(e.target.files[0])}
            />
          </div>
          <label>Email</label>
          <input
            type="text"
            value={texts.email}
            name="email"
            onChange={handleChange}
          />
          <label>Username</label>
          <input
            type="text"
            value={texts.username}
            name="username"
            onChange={handleChange}
          />
          <button onClick={handleClick}>Edit Profile</button>
        </form>
        <button className="close" onClick={() => setOpenEdit(false)}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Edit;