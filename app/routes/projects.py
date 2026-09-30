import csv
import io
import os
import uuid
from datetime import datetime, timezone

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
    Response,
)
from flask_login import login_required
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models.project import Project
from ..models.boq_item import BOQItem
from ..models.cost_entry import CostEntry
from ..models.supplier import Supplier
from ..models.audit_log import AuditLog, log_action
from ..models.document import Document
from ..forms.project_forms import ProjectForm
from ..forms.boq_forms import BOQItemForm
from ..forms.cost_forms import CostEntryForm

projects_bp = Blueprint("projects", __name__)


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in current_app.config["ALLOWED_EXTENSIONS"]
    )


@projects_bp.route("/projects")
@login_required
def list_projects():
    page = request.args.get("page", 1, type=int)
    search = request.args.get("search", "")
    query = Project.query
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%"))
    pagination = query.order_by(Project.id.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    return render_template(
        "projects/list.html",
        projects=pagination.items,
        pagination=pagination,
        search=search,
    )


@projects_bp.route("/projects/create", methods=["GET", "POST"])
@login_required
def create_project():
    form = ProjectForm()
    if form.validate_on_submit():
        project = Project(
            name=form.name.data,
            client_name=form.client_name.data,
            location=form.location.data,
            budget=form.budget.data,
            start_date=form.start_date.data,
            end_date=form.end_date.data,
        )
        db.session.add(project)
        db.session.commit()
        log_action(
            "create_project",
            f"Project '{project.name}' created (ID {project.id})",
        )
        flash("Project created successfully")
        return redirect(url_for("projects.list_projects"))
    return render_template("projects/form.html", form=form)


@projects_bp.route("/projects/<int:project_id>")
@login_required
def project_detail(project_id):
    project = Project.query.get_or_404(project_id)
    return render_template("projects/detail.html", project=project)


@projects_bp.route("/projects/<int:project_id>/edit", methods=["GET", "POST"])
@login_required
def edit_project(project_id):
    project = Project.query.get_or_404(project_id)
    form = ProjectForm(obj=project)
    if form.validate_on_submit():
        project.name = form.name.data
        project.client_name = form.client_name.data
        project.location = form.location.data
        project.budget = form.budget.data
        project.start_date = form.start_date.data
        project.end_date = form.end_date.data
        db.session.commit()
        log_action(
            "edit_project",
            f"Project '{project.name}' updated (ID {project.id})",
        )
        flash("Project updated successfully")
        return redirect(
            url_for("projects.project_detail", project_id=project.id)
        )
    return render_template("projects/form.html", form=form, project=project)


@projects_bp.route("/projects/<int:project_id>/status/<string:status>")
@login_required
def change_status(project_id, status):
    project = Project.query.get_or_404(project_id)
    allowed = current_app.config["PROJECT_STATUSES"]
    if status not in allowed:
        flash("Invalid project status", "danger")
        return redirect(
            url_for("projects.project_detail", project_id=project.id)
        )
    old_status = project.status
    project.status = status
    db.session.commit()
    log_action(
        "change_status",
        f"Project '{project.name}' status: {old_status} -> {status}",
    )
    flash(f"Project status changed to {status}")
    return redirect(
        url_for("projects.project_detail", project_id=project.id)
    )


@projects_bp.route("/projects/<int:project_id>/boq/add", methods=["GET", "POST"])
@login_required
def add_boq_item(project_id):
    project = Project.query.get_or_404(project_id)
    form = BOQItemForm()
    if form.validate_on_submit():
        duplicate = BOQItem.query.filter_by(
            project_id=project.id, item_code=form.item_code.data
        ).first()
        if duplicate:
            flash(
                f"Item code '{form.item_code.data}' already exists "
                "in this project",
                "danger",
            )
            return render_template(
                "projects/boq_form.html", form=form, project=project
            )
        item = BOQItem(
            project_id=project.id,
            item_code=form.item_code.data,
            description=form.description.data,
            unit=form.unit.data,
            quantity=form.quantity.data,
            unit_price=form.unit_price.data,
        )
        db.session.add(item)
        db.session.commit()
        log_action(
            "add_boq_item",
            f"BOQ item {item.item_code} added to '{project.name}'",
        )
        flash("BOQ item added successfully")
        return redirect(
            url_for("projects.project_detail", project_id=project.id)
        )
    return render_template(
        "projects/boq_form.html", form=form, project=project
    )


@projects_bp.route("/projects/<int:project_id>/boq/<int:item_id>/delete", methods=["POST"])
@login_required
def delete_boq_item(project_id, item_id):
    project = Project.query.get_or_404(project_id)
    item = BOQItem.query.filter_by(id=item_id, project_id=project.id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    log_action(
        "delete_boq_item",
        f"BOQ item {item.item_code} deleted from '{project.name}'",
    )
    flash("BOQ item deleted")
    return redirect(
        url_for("projects.project_detail", project_id=project.id)
    )


@projects_bp.route("/projects/<int:project_id>/costs/add", methods=["GET", "POST"])
@login_required
def add_cost_entry(project_id):
    project = Project.query.get_or_404(project_id)
    form = CostEntryForm()
    form.supplier_id.choices = [(0, "-- No supplier --")] + [
        (s.id, s.name) for s in Supplier.query.order_by(Supplier.name).all()
    ]
    if form.validate_on_submit():
        supplier_id = form.supplier_id.data or None
        if supplier_id:
            supplier = db.session.get(Supplier, supplier_id)
            if supplier is None:
                flash("Selected supplier no longer exists", "danger")
                return render_template(
                    "projects/cost_form.html", form=form, project=project
                )
        cost = CostEntry(
            project_id=project.id,
            supplier_id=supplier_id,
            category=form.category.data,
            description=form.description.data,
            amount=form.amount.data,
            entry_date=form.entry_date.data,
        )
        db.session.add(cost)
        db.session.commit()
        log_action(
            "add_cost_entry",
            f"Cost {form.category.data} of {cost.amount} added to "
            f"'{project.name}'",
        )
        flash("Cost entry added successfully")
        return redirect(
            url_for("projects.project_detail", project_id=project.id)
        )
    return render_template(
        "projects/cost_form.html", form=form, project=project
    )


@projects_bp.route("/projects/<int:project_id>/costs/<int:cost_id>/delete", methods=["POST"])
@login_required
def delete_cost_entry(project_id, cost_id):
    project = Project.query.get_or_404(project_id)
    cost = CostEntry.query.filter_by(
        id=cost_id, project_id=project.id
    ).first_or_404()
    db.session.delete(cost)
    db.session.commit()
    log_action(
        "delete_cost_entry",
        f"Cost entry ({cost.category}) deleted from '{project.name}'",
    )
    flash("Cost entry deleted")
    return redirect(
        url_for("projects.project_detail", project_id=project.id)
    )


@projects_bp.route(
    "/projects/<int:project_id>/documents/upload", methods=["POST"]
)
@login_required
def upload_document(project_id):
    project = Project.query.get_or_404(project_id)
    file = request.files.get("file")

    if file is None or file.filename == "":
        flash("No file selected", "danger")
        return redirect(
            url_for("projects.project_detail", project_id=project.id)
        )

    if not allowed_file(file.filename):
        flash(
            "File type not allowed. Allowed: "
            + ", ".join(sorted(current_app.config["ALLOWED_EXTENSIONS"])),
            "danger",
        )
        return redirect(
            url_for("projects.project_detail", project_id=project.id)
        )

    original_name = file.filename
    safe_name = secure_filename(original_name) or "file"
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, unique_name))

    doc = Document(
        project_id=project.id,
        filename=unique_name,
        original_name=original_name,
    )
    db.session.add(doc)
    db.session.commit()
    log_action(
        "upload_document",
        f"Document '{original_name}' uploaded to '{project.name}'",
    )
    flash("Document uploaded successfully")
    return redirect(
        url_for("projects.project_detail", project_id=project.id)
    )


@projects_bp.route("/projects/<int:project_id>/documents/<int:doc_id>/download")
@login_required
def download_document(project_id, doc_id):
    doc = Document.query.filter_by(
        id=doc_id, project_id=project_id
    ).first_or_404()
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        doc.filename,
        as_attachment=True,
        download_name=doc.original_name,
    )


@projects_bp.route("/projects/<int:project_id>/documents/<int:doc_id>/delete", methods=["POST"])
@login_required
def delete_document(project_id, doc_id):
    project = Project.query.get_or_404(project_id)
    doc = Document.query.filter_by(
        id=doc_id, project_id=project.id
    ).first_or_404()

    path = os.path.join(current_app.config["UPLOAD_FOLDER"], doc.filename)
    if os.path.isfile(path):
        os.remove(path)

    db.session.delete(doc)
    db.session.commit()
    log_action(
        "delete_document",
        f"Document '{doc.original_name}' deleted from '{project.name}'",
    )
    flash("Document deleted")
    return redirect(
        url_for("projects.project_detail", project_id=project.id)
    )


def build_report_rows():
    rows = []
    for project in Project.query.order_by(Project.name).all():
        boq_total = float(
            sum(item.total_price for item in project.boq_items)
        )
        actual_total = float(
            sum(cost.amount for cost in project.cost_entries)
        )
        profit = boq_total - actual_total
        margin = (profit / boq_total * 100) if boq_total > 0 else 0
        rows.append({
            "project": project,
            "boq_total": boq_total,
            "actual_total": actual_total,
            "profit": profit,
            "margin": margin,
        })
    return rows


@projects_bp.route("/reports")
@login_required
def reports():
    return render_template(
        "projects/reports.html", report_data=build_report_rows()
    )


@projects_bp.route("/reports/export")
@login_required
def export_reports():
    output = [["Project", "BOQ Total", "Actual Costs", "Profit/Loss", "Margin %"]]
    for row in build_report_rows():
        output.append([
            row["project"].name,
            f"{row['boq_total']:.2f}",
            f"{row['actual_total']:.2f}",
            f"{row['profit']:.2f}",
            f"{row['margin']:.2f}",
        ])

    csv_data = io.StringIO()
    writer = csv.writer(csv_data)
    for record in output:
        writer.writerow(record)

    response = Response(
        "﻿" + csv_data.getvalue(),
        mimetype="text/csv",
    )
    response.headers["Content-Disposition"] = (
        f"attachment; filename=reports_{datetime.now(timezone.utc):%Y%m%d_%H%M%S}.csv"
    )
    return response


@projects_bp.route("/audit-logs")
@login_required
def audit_logs():
    page = request.args.get("page", 1, type=int)
    action_filter = request.args.get("action", "")
    query = AuditLog.query
    if action_filter:
        query = query.filter(AuditLog.action == action_filter)
    pagination = query.order_by(AuditLog.created_at.desc()).paginate(
        page=page, per_page=25, error_out=False
    )
    actions = [
        r[0]
        for r in db.session.query(AuditLog.action).distinct().order_by(AuditLog.action)
    ]
    return render_template(
        "projects/audit_logs.html",
        logs=pagination.items,
        pagination=pagination,
        actions=actions,
        action_filter=action_filter,
    )
