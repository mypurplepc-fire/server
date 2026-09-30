from ..extensions import db


class BOQItem(db.Model):
    __tablename__ = "boq_items"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    item_code = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Numeric(15, 3), nullable=False)
    unit_price = db.Column(db.Numeric(15, 2), nullable=False)

    @property
    def total_price(self):
        return float(self.quantity) * float(self.unit_price)
