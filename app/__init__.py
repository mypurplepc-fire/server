import os

from flask import Flask, flash, redirect, render_template, request, url_for

from .config import Config
from .extensions import csrf, db, login_manager, migrate

# Import every model so Alembic always sees the complete schema.
from .models.user import User
from .models.project import Project
from .models.boq_item import BOQItem
from .models.cost_entry import CostEntry
from .models.supplier import Supplier
from .models.audit_log import AuditLog
from .models.document import Document


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        flash("Please log in to continue.")
        if request.args:
            return redirect(url_for("auth.login", next=request.full_path))
        return redirect(url_for("auth.login"))

    from .routes.main import main_bp
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.projects import projects_bp
    from .routes.suppliers import suppliers_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(suppliers_bp)

    @app.after_request
    def no_cache(response):
        if response.mimetype == "text/html":
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        return response

    def render_error(code, title, message):
        return render_template(
            "error.html", code=code, title=title, message=message
        ), code

    @app.errorhandler(403)
    def forbidden(_e):
        return render_error(
            403,
            "Access denied",
            "You do not have permission to view this page.",
        )

    @app.errorhandler(404)
    def not_found(_e):
        return render_error(
            404,
            "Page not found",
            "The page you are looking for does not exist or was moved.",
        )

    @app.errorhandler(413)
    def too_large(_e):
        return render_error(
            413,
            "File too large",
            "The file exceeds the maximum upload size of 16 MB.",
        )

    @app.errorhandler(500)
    def server_error(_e):
        db.session.rollback()
        return render_error(
            500,
            "Something went wrong",
            "An unexpected error occurred. Please try again.",
        )

    return app
