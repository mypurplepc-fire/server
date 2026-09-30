from functools import wraps

from flask import Blueprint, abort, flash, redirect, render_template, url_for
from flask_login import current_user, login_required

from ..extensions import db
from ..models.user import User
from ..models.audit_log import log_action
from ..forms.user_forms import ChangePasswordForm, UserForm

users_bp = Blueprint("users", __name__)


def admin_required(view):
    @wraps(view)
    @login_required
    def wrapped(*args, **kwargs):
        if current_user.role != "admin":
            abort(403)
        return view(*args, **kwargs)

    return wrapped


@users_bp.route("/users")
@admin_required
def list_users():
    users = User.query.order_by(User.id).all()
    return render_template("users/list.html", users=users)


@users_bp.route("/users/create", methods=["GET", "POST"])
@admin_required
def create_user():
    form = UserForm()
    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data,
            role=form.role.data,
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        log_action(
            "create_user",
            f"User '{user.username}' created with role {user.role}",
        )
        flash("User created successfully")
        return redirect(url_for("users.list_users"))
    return render_template("users/form.html", form=form)


@users_bp.route("/profile")
@login_required
def profile():
    return render_template("users/profile.html")


@users_bp.route("/change-password", methods=["GET", "POST"])
@login_required
def change_password():
    form = ChangePasswordForm()
    if form.validate_on_submit():
        if current_user.check_password(form.current_password.data):
            current_user.set_password(form.new_password.data)
            db.session.commit()
            log_action(
                "change_password",
                f"User '{current_user.username}' changed their password",
            )
            flash("Password changed successfully")
            return redirect(url_for("users.profile"))
        flash("Current password is incorrect", "danger")
    return render_template("users/change_password.html", form=form)
