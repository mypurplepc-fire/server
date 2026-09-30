from flask import Blueprint, render_template, redirect, url_for, flash
from flask_login import login_required
from ..extensions import db
from ..models.supplier import Supplier
from ..models.audit_log import log_action
from ..forms.supplier_forms import SupplierForm

suppliers_bp = Blueprint("suppliers", __name__)


@suppliers_bp.route("/suppliers")
@login_required
def list_suppliers():
    suppliers = Supplier.query.all()
    return render_template("suppliers/list.html", suppliers=suppliers)


@suppliers_bp.route("/suppliers/create", methods=["GET", "POST"])
@login_required
def create_supplier():
    form = SupplierForm()
    if form.validate_on_submit():
        supplier = Supplier(
            name=form.name.data,
            contact_person=form.contact_person.data,
            phone=form.phone.data,
            email=form.email.data,
            address=form.address.data,
        )
        db.session.add(supplier)
        db.session.commit()
        log_action(
            "create_supplier",
            f"Supplier '{supplier.name}' created (ID {supplier.id})",
        )
        flash("Supplier created successfully")
        return redirect(url_for("suppliers.list_suppliers"))
    return render_template("suppliers/form.html", form=form)