"""User model tests."""

#    FLASK_ENV=production python -m unittest test_user_model.py


import os
from unittest import TestCase
from sqlalchemy import exc

from models import db, User, Message, Follows


os.environ['DATABASE_URL'] = "postgresql:///server-test"


from app import app


db.create_all()


class UserModelTestCase(TestCase):
    """Test views for messages."""

    def setUp(self):
        """Create test client, add sample data."""

        db.drop_all()
        db.create_all()

        user1 = User.signup('user1', 'user1@gmail.com', 'password')
        user1_id = 111
        user1.id = user1_id

        user2 = User.signup('user2', 'user2@gmail.com', 'password')
        user2_id = 222
        user2.id = user2_id

        db.session.commit()

        self.user1 = User.query.get(user1_id)
        self.user1_id = user1_id

        self.user2 = User.query.get(user2_id)
        self.user2_id = user2_id

        self.client = app.test_client()

    def tearDown(self):
        response = super().tearDown()
        db.session.rollback()
        return response

    def test_user_model(self):
        """Does basic model work?"""

        u = User(
            email="test@test.com",
            username="testuser",
            password="HASHED_PASSWORD"
        )

        db.session.add(u)
        db.session.commit()

        # User should have no messages & no followers
        self.assertEqual(len(u.messages), 0)
        self.assertEqual(len(u.followers), 0)
        self.assertEqual(len(u.following), 0)
        self.assertEqual(len(u.likes), 0)
    
    """Follow Tests"""

    def test_user_following(self):
        self.user1.following.append(self.user2)
        db.session.commit()

        self.assertEqual(len(self.user2.following), 0)
        self.assertEqual(len(self.user2.followers), 1)
        self.assertEqual(len(self.user1.following), 1)
        self.assertEqual(len(self.user1.followers), 0)

        self.assertEqual(self.user1.following[0].id, self.user2_id)
        self.assertEqual(self.user2.followers[0].id, self.user1_id)

    def test_is_following(self):
        self.user1.following.append(self.user2)
        db.session.commit()

        self.assertTrue(self.user1.is_following(self.user2))
        self.assertFalse(self.user2.is_following(self.user1))

    def test_is_followed_by(self):
        self.user1.following.append(self.user2)
        db.session.commit()

        self.assertTrue(self.user2.is_followed_by(self.user1))
        self.assertFalse(self.user1.is_followed_by(self.user2))

    """sign up Test"""

    def test_correct_signup(self):
        new_user = User.signup('newUser', 'newuser@gmail.com', 'password')
        new_user_id = 1212
        new_user.id = new_user_id
        db.session.commit()

        new_user = User.query.get(new_user_id)
        self.assertIsNotNone(new_user)
        self.assertEqual(new_user.username, 'newUser')
        self.assertEqual(new_user.email, 'newuser@gmail.com')
        self.assertNotEqual(new_user.password, 'password')
        self.assertTrue(new_user.password.startswith('$2b$'))

    def test_incorrect_username_signup(self):
        incorrect = User.signup(None, 'incorrect@gmail.com', 'password')
        incorrect_id = 121434
        incorrect.id = incorrect_id

        with self.assertRaises(exc.IntegrityError) as context:
            db.session.commit()

    def test_incorrect_email_signup(self):
        incorrect2 = User.signup('incorrect2', None , 'password')
        incorrect2_id = 12143433
        incorrect2.id = incorrect2_id

        with self.assertRaises(exc.IntegrityError) as context:
            db.session.commit()

    """login tests"""
    def test_valid_login(self):
        user = User.authenticate(self.user1.username, 'password')
        self.assertIsNotNone(user)
    
    def test_invalid_username_login(self):
        self.assertFalse(User.authenticate('invalid', 'password'))

    def test_invalid_password_login(self):
        self.assertFalse(User.authenticate(self.user1.username, 'sdfsord'))