
# (Foodie) Social Media App for Foodies

Social media platform built using Backend Rest Api written in SQL Alchemy and Flask. 


## 🛠 Technologies

**Server:** Flask, SQL Alchemy, JSON Web Token, Bcrypt

**User(Front End inside Server Folder):** ReactJS, Context, Firebase

**Api:** Socketio




## Features

- Register a new account, and log in or sign out as an existing user
- User could change their profile settings including their profile and background image
- User can choose to see the app in darkmode or lightmode and that data is saved to local storage
- On the homepage, user can see who they follow and their posts with newer dates at the top (Descending order)
- User can see their follower and who they are following
- User can also see other user's followers and following 
- User can search another user by their username, and follow them
- User can create a new post with an image, like post, comment post, and delete their own post (Image uploading works in mobile as well)
- User can create a new conversation and chat with another user
- With Socketio, if one user likes, comments on the post or messages another user, then the other user will get an instant notification
- UI adjustment depending on Tablet, Mobile and a computer screen






## Screenshots

![App Screenshot](https://i.ibb.co/c2VW46m/29.png)
![App Screenshot](https://i.ibb.co/HgLbrQp/30.png)
![App Screenshot](https://i.ibb.co/XbvDzPV/31.png)
![App Screenshot](https://i.ibb.co/b7shVty/32.png)
![App Screenshot](https://i.ibb.co/kgMhL5Z/33.png)
![App Screenshot](https://i.ibb.co/9b5KstN/34.png)
![App Screenshot](https://i.ibb.co/Ss96k7Y/35.png)
![App Screenshot](https://i.ibb.co/X5Nsk60/36.png)







## Installation and Setup Instructions

Install with npm

```bash
# Clone the Repository

  git clone https://github.com/eric2408/food.git

# Front-end

  cd user 

  npm Install

  npm start

# Back-end

  cd server

  source venv/bin/activate

  pip install -r requirements.txt

  createdb server

  python seed.py

  flask run
```
    
## Login Info

#User

**Email:** eric123@gmail.com

**Password:** 123456


#User 2

**Email:** Steve123@gmail.com

**Password:** 123456

## Demo

https://foodieland1234.herokuapp.com/
