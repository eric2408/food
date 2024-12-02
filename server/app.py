import os
from cProfile import Profile
from crypt import methods

from flask import Flask, request, json, jsonify
from flask_socketio import SocketIO, emit
# from flask_debugtoolbar import DebugToolbarExtension
from flask.helpers import send_from_directory
from sqlalchemy.exc import IntegrityError

# from forms import UserAddForm, LoginForm, MessageForm, ProfileForm
from models import db, connect_db, User, Message, Comments, Letter, Conversation
from flask_cors import CORS
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager

from datetime import datetime, timedelta, timezone

CURR_USER_KEY = "curr_user"

app = Flask(__name__, static_folder='user/build', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)
# Get DB_URI from environ variable (useful for production/testing) or,
# if not set there, use development local db
app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgresql:///server'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "it's a secret")
# toolbar = DebugToolbarExtension(app)
app.config["JWT_SECRET_KEY"] = "thisissecret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

connect_db(app)

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

##############################################################################
# User register/login

@app.route("/register", methods=["POST"])
def register_user():
    username = request.json["username"]
    email = request.json["email"]
    password = request.json["password"]

    user_exists = User.query.filter_by(email=email).first() is not None

    print(user_exists)

    if user_exists:
        return jsonify({"error": {"code": 401, "message": "User already exists"}}), 401

    user = User.signup(
                username=username,
                email=email,
                password=password
            )
    db.session.commit()

    return jsonify({
        "username": user.username,
        "email": user.email
    })

@app.route('/login', methods=["POST"])
def login():
    """Handle user login."""

    email = request.json["email"]
    password = request.json["password"]

    user = User.authenticate(                
                email=email,
                password=password
            )
    
    if user is None:
        return jsonify({"error": "Unauthorized"}), 401        

    access_token = create_access_token(identity=email)

    return jsonify({
        "username": user.username,
        "email": user.email,
        "id": user.id,
        "access_token":access_token
    })

##############################################################################
# General user routes:

@app.route('/users')
def list_users():
    """Page with listing of users.

    Can take a 'q' param in querystring to search by that username.
    """

    search = request.args.get('q')

    if not search:
        users = User.query.all()
    else:
        users = User.query.filter(User.username.like(f"%{search}%")).limit(7).all()

    serialized = [u.serialize() for u in users]
    return jsonify(users=serialized)

@app.route('/users/<int:user_id>')
def users_show(user_id):
    """Show user profile."""

    user = User.query.get_or_404(user_id)

    
    messages = (Message
                .query
                .filter(Message.user_id == user_id)
                .order_by(Message.timestamp.desc())
                .limit(100)
                .all())


    serialized = user.serialize()
    serializedTwo = [m.serialize() for m in messages]

    return jsonify(user=serialized, messages=serializedTwo)

@app.route('/users/<int:user_id>/following')
def show_following(user_id):
    """Show list of people this user is following."""

    user = User.query.get_or_404(user_id)
    serialized = user.serialize()
    return jsonify(user=serialized)

@app.route('/users/<int:user_id>/followers')
def users_followers(user_id):
    """Show list of followers of this user."""

    user = User.query.get_or_404(user_id)
    serialized = user.serialize()
    return jsonify(user=serialized)

@app.route('/users/follow/<int:follow_id>', methods=['POST'])
def add_follow(follow_id):
    """Add a follow for the currently-logged-in user."""
    userId = request.json["userId"]

    followed_user = User.query.get_or_404(follow_id)
    user = User.query.get_or_404(userId)
    user.following.append(followed_user)
    db.session.commit()

    return jsonify({"user": "following added"})    

@app.route('/users/unfollow/<int:follow_id>', methods=['POST'])
def stop_following(follow_id):
    """Have currently-logged-in-user stop following this user."""
    userId = request.json["userId"]
    user = User.query.get_or_404(userId)

    followed_user = User.query.get(follow_id)
    user.following.remove(followed_user)
    db.session.commit()

    return jsonify({"user": "unfollowed user"})  

@app.route('/users/<int:user_id>/update', methods=["POST"])
def profile(user_id):
    """Update profile for current user."""

    email = request.json["email"]
    username = request.json["username"]
    image_url = request.json["image_url"]
    header_image_url = request.json["header_image_url"]

    user = User.query.get_or_404(user_id)

    if(user):
            user.email = email
            user.username = username
            user.image_url = image_url
            user.header_image_url = header_image_url

            db.session.commit()

            return jsonify({"user": "edit user profile successful"})  
    
@app.route('/users/<int:user_id>/delete', methods=["POST"])
def delete_user(user_id):
    """Delete user."""
    user = User.query.get_or_404(user_id)

    db.session.delete(user)
    db.session.commit()

    return jsonify({"user": "user account deleted"})  

##############################################################################
# Messages routes:

@app.route('/messages/<int:user_id>/new', methods=["POST"])
def messages_add(user_id):
    """Add a message:

   If valid, update message and redirect to user page.
    """
    user = User.query.get_or_404(user_id)

    message = request.json["text"]
    image = request.json["images"]

    msg = Message(
            text=message,
            imageUrl=image
        )

    user.messages.append(msg)
    db.session.add(msg)
    db.session.commit()

    return jsonify({"status": "post created"}) 

@app.route('/messages/<int:message_id>', methods=["GET"])
def messages_show(message_id):
    """Show a message."""
    msg = Message.query.get_or_404(message_id)
    serialized = msg.serialize()
    return jsonify(msg=serialized)

@app.route('/messages/<int:message_id>/delete', methods=["POST"])
def messages_destroy(message_id):
    """Delete a message."""
    userId = request.json["userId"]
    user = User.query.get_or_404(userId)
    msg = Message.query.get_or_404(message_id)

    if msg.user_id != user.id:
        return 403

    db.session.delete(msg)
    db.session.commit()

    return jsonify({"status": "post deleted"}) 

##############################################################################
# likes

@app.route('/messages/<int:message_id>/like', methods=['GET'])
def get_like(message_id):
    """Query the post likes"""

    liked_message = Message.query.get_or_404(message_id)
    likes = [msg.id for msg in liked_message.likes]

    return jsonify(likes)

@app.route('/messages/<int:message_id>/like', methods=['POST'])
def add_like(message_id):
    """Active user likes the post"""

    userId = request.json["userId"]
    user = User.query.get_or_404(userId)
    liked_message = Message.query.get_or_404(message_id)

    if user not in liked_message.likes:
        liked_message.likes.append(user)
        db.session.commit()

    return jsonify({"status": "liked the post"}) 

@app.route('/messages/<int:message_id>/deleteLike', methods=['POST'])
def delete_like(message_id):
    """Delete a liked message for the currently-logged-in user."""

    userId = request.json["userId"]
    user = User.query.get_or_404(userId)
    liked_message = Message.query.get_or_404(message_id)

    if user in liked_message.likes:
        liked_message.likes.remove(user)
        db.session.commit()

    return jsonify({"status": "unliked the post"}) 

##############################################################################
# Comments

@app.route('/messages/<int:messageId>/comments', methods=['GET'])
def get_comments(messageId):
    """Bring Message comments"""

    comments = (Comments
                .query
                .filter(Comments.message_id == messageId)
                .order_by(Comments.timestamp.desc())
                .limit(50)
                .all())

    serialized = [c.serialize() for c in comments]

    return jsonify(comments=serialized)

@app.route('/messages/<int:message_id>/comments', methods=['POST'])
def add_comments(message_id):
    """Like a message for the currently-logged-in user."""

    userId = request.json["userId"]
    comment = request.json["text"]

    user = User.query.get_or_404(userId)

    cmts = Comments(
            text=comment,
            message_id=message_id,
            user_id=userId
        )

    db.session.add(cmts)

    db.session.commit()

    return jsonify({"status": "comment created"}) 

@app.route('/comments/<int:comment_id>/delete', methods=['POST'])
def delete_comments(comment_id):
    """Like a message for the currently-logged-in user."""

    userId = request.json["userId"]
    user = User.query.get_or_404(userId)
    cmts = Comments.query.get_or_404(comment_id)

    if cmts.user_id != user.id:
        return 403

    db.session.delete(cmts)
    db.session.commit()

    return jsonify({"status": "comment deleted"})  

##############################################################################
# User Conversation

@app.route('/conversation', methods=['POST'])
def add_convo():
    """Create a new conversation"""

    senderId = request.json["senderId"]
    receiverId = request.json["receiverId"]

    convo = Conversation(
            members=[senderId, receiverId]
        )

    db.session.add(convo)
    db.session.commit()

    return jsonify({"user": "conversation created"})

@app.route('/conversation/<int:user_id>', methods=['GET'])
def get_userconvo(user_id):
    """Bring user's conversation"""

    convo = Conversation.query.all()
# .filter(Conversation.members.contains([str(user_id)]))

    serialized = [c.serialize() for c in convo]

    return jsonify(convo=serialized)

##############################################################################
# User letter    

@app.route('/letters', methods=['POST'])
def add_letter():
    """Like a message for the currently-logged-in user."""

    conversationId = request.json["conversationId"]
    sender = request.json["sender"]
    text = request.json["text"]

    letter = Letter(
            conversationId=conversationId,
            sender=sender,
            text=text
        )

    db.session.add(letter)
    db.session.commit()

    return jsonify({
        "conversationId": letter.conversationId,
        "sender": letter.sender,
        "text": letter.text
    })

@app.route('/letters/<int:conversation_id>', methods=['GET'])
def get_letter(conversation_id):
    """Bring letter according to the conversationId"""

    letters = Letter.query.filter(Letter.conversationId == str(conversation_id)).all()

    serialized = [l.serialize() for l in letters]

    return jsonify(letters=serialized)

##############################################################################
# Homepage and error pages

@app.route('/<int:user_id>')
def homepage(user_id):
    """Show homepage:

    - anon users: no messages
    - logged in: 100 most recent messages of followed_users
    """

    user = User.query.get_or_404(user_id)

    following_ids = [f.id for f in user.following] + [user_id]
    messages = (Message
                    .query
                    .filter(Message.user_id.in_(following_ids))
                    .order_by(Message.timestamp.desc())
                    .limit(100)
                    .all())

    serialized = [m.serialize() for m in messages]

    return jsonify(messages=serialized)

##############################################################################
# Turn off all caching in Flask

@app.after_request
def add_header(req):
    """Add non-caching headers on every request."""
    req.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    req.headers["Pragma"] = "no-cache"
    req.headers["Expires"] = "0"
    req.headers['Cache-Control'] = 'public, max-age=0'
    return req

def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response

##############################################################################
# Socket Connection

users = []

def addU(userId, socketId):
    if (not any(u["userId"] == userId for u in users)):
         users.append({ "userId": userId, "socketId": socketId})

def selectU(x):
    if (u["socketId"] == x for u in users):
        return False
    else:
        return True     

def getU(uId):
    for u in users:
        if (u["userId"] == int(uId)):
            print(u)

def removeU(socketId):
    filter(selectU(socketId),users)

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print("client has connected")

    emit("connect",{"data":"user is connected"})

@socketio.on("addUser")
def add(userId):
    addU(userId, request.sid)
    print(users)
    socketio.emit("getUsers", users)

@socketio.on("sendMessage")
def send(msg):
    user = getU(msg["receiverId"])
    socketio.emit('getMessage', {'senderId': msg["senderId"], 'text': msg['text']})

@socketio.on("sendNotification")
def notification(notif):
    print(notif)
    socketio.emit("getNotification", {'sender': notif["sender"], 'receiverId': notif["receiverId"], 'type': notif['type']})    

@socketio.on("send")
def notification(notif):
    print(notif)
    socketio.emit("get", {'sender': notif["sender"], 'receiverId': notif["receiverId"], 'type': notif['type']})       

@socketio.on("disconnect")
def disconnected():
    """event listener when client connects to the server"""
    print("client has disconnected")
    removeU(request.sid)
    socketio.emit("getUsers", users)

if __name__ == '__main__':
    socketio.run(app)
    app.run()        