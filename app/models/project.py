from ..extensions import db


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    client_name = db.Column(db.String(200))
    location = db.Column(db.String(300))
    status = db.Column(db.String(20), default="active")
    budget = db.Column(db.Numeric(15, 2), default=0)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    boq_items = db.relationship(
        "BOQItem", backref="project", lazy=True, cascade="all, delete-orphan"
    )
    cost_entries = db.relationship(
        "CostEntry", backref="project", lazy=True, cascade="all, delete-orphan"
    )
    documents = db.relationship(
        "Document", backref="project", lazy=True, cascade="all, delete-orphan"
    )
