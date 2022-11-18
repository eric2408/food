"""Message View tests."""

#    FLASK_ENV=production python -m unittest test_message_views.py


import os
from unittest import TestCase

from models import db, connect_db, Message, User

import json


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
        db.session.commit()

    def test_add_message(self):
        """Can use add a message?"""

        with self.client as c:

            msg = {
                "text": "Hello",
                "images": "image"
            }

            resp = c.post(f"/messages/{self.testuser_id}/new", data=json.dumps(msg), content_type='application/json')

            self.assertEqual(resp.status_code, 200)

            msg = Message.query.one()
            self.assertEqual(msg.text, "Hello")


    def test_show_message(self):

        m = Message(
            id=2342,
            text="this is a test",
            user_id=self.testuser_id
        )

        db.session.add(m)
        db.session.commit()

        with self.client as c:

            m = Message.query.get(2342)

            response = c.get(f'/messages/{m.id}')

            self.assertEqual(response.status_code, 200)
            self.assertIn(m.text, str(response.data))

    def test_invalid_message_show(self):
        with self.client as c:
            
            resp = c.get('/messages/99999999')

            self.assertEqual(resp.status_code, 404)

    
    def test_message_delete(self):

        m = Message(
            id=1234,
            text="a test message",
            user_id=self.testuser_id
        )
        db.session.add(m)
        db.session.commit()

        user = {
            "userId": self.testuser_id
        }

        with self.client as c:

            resp = c.post("/messages/1234/delete", data=json.dumps(user), content_type='application/json')
            self.assertEqual(resp.status_code, 200)

            m = Message.query.get(1234)
            self.assertIsNone(m)   

    def test_unauthorized_message_delete(self):

        u = User.signup(username="unauthorized-user",
                        email="testtest@test.com",
                        password="password")
        u.id = 76543

        m = Message(
            id=1234,
            text="a test message",
            user_id=self.testuser_id
        )
        db.session.add_all([u, m])
        db.session.commit()

        with self.client as c:

            resp = c.post("/messages/1234/delete")
            self.assertEqual(resp.status_code, 500)

            m = Message.query.get(1234)
            self.assertIsNotNone(m)
