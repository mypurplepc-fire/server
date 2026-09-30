from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length
from ..models.user import User


class UserForm(FlaskForm):
    username = StringField(
        "Username",
        validators=[
            DataRequired(),
            Length(min=3, max=80),
        ],
    )
    email = StringField(
        "Email",
        validators=[DataRequired(), Email(), Length(max=120)],
    )
    password = PasswordField(
        "Password",
        validators=[DataRequired(), Length(min=8)],
    )
    confirm_password = PasswordField(
        "Confirm Password",
        validators=[DataRequired(), EqualTo("password")],
    )
    role = SelectField(
        "Role",
        choices=[("user", "User"), ("admin", "Admin")],
        default="user",
    )
    submit = SubmitField("Save")

    def validate_username(self, field):
        exists = User.query.filter_by(username=field.data).first()
        if exists:
            raise ValueError("That username is already taken")

    def validate_email(self, field):
        exists = User.query.filter_by(email=field.data).first()
        if exists:
            raise ValueError("That email is already registered")


class ChangePasswordForm(FlaskForm):
    current_password = PasswordField(
        "Current Password", validators=[DataRequired()]
    )
    new_password = PasswordField(
        "New Password",
        validators=[DataRequired(), Length(min=8)],
    )
    confirm_password = PasswordField(
        "Confirm New Password",
        validators=[DataRequired(), EqualTo("new_password")],
    )
    submit = SubmitField("Change Password")
