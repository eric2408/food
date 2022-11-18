"""User View tests."""

#    FLASK_ENV=production python -m unittest test_user_views.py


import os
from unittest import TestCase

import json

from models import db, connect_db, Message, User, Likes, Follows

os.environ['DATABASE_URL'] = "postgresql:///warbler-test"



from app import app, CURR_USER_KEY



db.create_all()


app.config['WTF_CSRF_ENABLED'] = False


class MessageViewTestCase(TestCase):
    """Test views for messages."""

    def setUp(self):
        """Create test client, add sample data."""

        db.drop_all()
        db.create_all()

        self.client = app.test_client()

        self.testuser = User.signup(username="testuser",
                                    email="test@test.com",
                                    password="testuser")
        self.testuser_id = 8989
        self.testuser.id = self.testuser_id

        self.u1 = User.signup("abc", "test1@test.com", "password")
        self.u1_id = 778
        self.u1.id = self.u1_id
        self.u2 = User.signup("efg", "test2@test.com", "password")
        self.u2_id = 884
        self.u2.id = self.u2_id
        self.u3 = User.signup("hij", "test3@test.com", "password")
        self.u4 = User.signup("testing", "test4@test.com", "password")

        db.session.commit()

    def tearDown(self):
        resp = super().tearDown()
        db.session.rollback()
        return resp

    def test_users_index(self):
        with self.client as c:
            resp = c.get("/users")

            self.assertIn("testuser", str(resp.data))
            self.assertIn("abc", str(resp.data))
            self.assertIn("efg", str(resp.data))
            self.assertIn("hij", str(resp.data))
            self.assertIn("testing", str(resp.data))

    def test_users_search(self):
        with self.client as c:
            resp = c.get("/users?q=test")

            self.assertIn("testuser", str(resp.data))
            self.assertIn("testing", str(resp.data))            

            self.assertNotIn("abc", str(resp.data))
            self.assertNotIn("efg", str(resp.data))
            self.assertNotIn("hij", str(resp.data))

    def test_user_show(self):
        with self.client as c:
            resp = c.get(f"/users/{self.testuser_id}")

            self.assertEqual(resp.status_code, 200)

            self.assertIn("testuser", str(resp.data))

    def setup_likes(self):
        m1 = Message(text="trending warble", user_id=self.testuser_id)
        m2 = Message(text="Eating some lunch", user_id=self.testuser_id)
        m3 = Message(id=9876, text="likable warble", user_id=self.u1_id)
        db.session.add_all([m1, m2, m3])
        db.session.commit()

        l1 = Likes(user_id=self.testuser_id, message_id=9876)

        db.session.add(l1)
        db.session.commit()

    def test_add_like(self):
        m = Message(id=1984, text="The earth is round", user_id=self.u1_id)
        db.session.add(m)
        db.session.commit()

        user = {
            "userId": self.testuser_id
        }

        with self.client as c:

            c.post("/messages/1984/like", data=json.dumps(user), content_type='application/json')
            resp = c.get("/messages/1984/like")
            self.assertEqual(resp.status_code, 200)

            likes = Likes.query.filter(Likes.message_id==1984).all()
            self.assertEqual(len(likes), 1)
            self.assertEqual(likes[0].user_id, self.testuser_id)

    def test_remove_like(self):
        self.setup_likes()

        m = Message.query.filter(Message.text=="likable warble").one()
        self.assertIsNotNone(m)
        self.assertNotEqual(m.user_id, self.testuser_id)

        l = Likes.query.filter(
            Likes.user_id==self.testuser_id and Likes.message_id==m.id
        ).one()

        self.assertIsNotNone(l)

        user = {
            "userId": self.testuser_id
        }

        with self.client as c:

            c.post(f"/messages/{m.id}/deleteLike", data=json.dumps(user), content_type='application/json')
            resp = c.get(f"/messages/{m.id}/like")
            self.assertEqual(resp.status_code, 200)

            likes = Likes.query.filter(Likes.message_id==m.id).all()
            self.assertEqual(len(likes), 0)

    def setup_followers(self):
        f1 = Follows(user_being_followed_id=self.u1_id, user_following_id=self.testuser_id)
        f2 = Follows(user_being_followed_id=self.u2_id, user_following_id=self.testuser_id)
        f3 = Follows(user_being_followed_id=self.testuser_id, user_following_id=self.u1_id)

        db.session.add_all([f1,f2,f3])
        db.session.commit()

    def test_user_show_with_follows(self):

        self.setup_followers()

        with self.client as c:
            resp = c.get(f"/users/{self.testuser_id}")

            self.assertEqual(resp.status_code, 200)

            self.assertIn("testuser", str(resp.data))


    def test_show_following(self):

        self.setup_followers()
        with self.client as c:

            resp = c.get(f"/users/{self.testuser_id}/following")
            self.assertEqual(resp.status_code, 200)
            self.assertIn(f"{self.u1_id}", str(resp.data))
            self.assertIn(f"{self.u2_id}", str(resp.data))
            self.assertNotIn("hij", str(resp.data))
            self.assertNotIn("testing", str(resp.data))

    def test_show_followers(self):

        self.setup_followers()
        with self.client as c:

            resp = c.get(f"/users/{self.testuser_id}/followers")

            self.assertIn(f"{self.u1_id}", str(resp.data))
            self.assertNotIn("efg", str(resp.data))
            self.assertNotIn("hij", str(resp.data))
            self.assertNotIn("testing", str(resp.data))
