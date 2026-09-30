from ..extensions import db


class CostEntry(db.Model):
    __tablename__ = "cost_entries"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    boq_item_id = db.Column(db.Integer, db.ForeignKey("boq_items.id"))
    supplier_id = db.Column(db.Integer, db.ForeignKey("suppliers.id"))
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    entry_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    supplier = db.relationship("Supplier", back_populates="cost_entries", lazy=True)
