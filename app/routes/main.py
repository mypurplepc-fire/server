from flask import Blueprint, render_template
from flask_login import login_required
from ..extensions import db
from ..models.project import Project
from ..models.cost_entry import CostEntry
from ..models.boq_item import BOQItem

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
@login_required
def index():
    projects = Project.query.all()
    total_budget = (
        db.session.query(db.func.sum(Project.budget)).scalar() or 0
    )
    total_actual = (
        db.session.query(db.func.sum(CostEntry.amount)).scalar() or 0
    )
    total_boq = (
        db.session.query(
            db.func.sum(BOQItem.quantity * BOQItem.unit_price)
        ).scalar()
        or 0
    )
    return render_template(
        "dashboard.html",
        projects=projects,
        total_budget=total_budget,
        total_actual=total_actual,
        total_boq=total_boq,
    )
