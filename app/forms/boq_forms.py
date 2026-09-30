from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField, SubmitField
from wtforms.validators import DataRequired, NumberRange


class BOQItemForm(FlaskForm):
    item_code = StringField("Item Code", validators=[DataRequired()])
    description = StringField("Description", validators=[DataRequired()])
    unit = StringField("Unit", validators=[DataRequired()])
    quantity = DecimalField(
        "Quantity", places=3, validators=[DataRequired(), NumberRange(min=0)]
    )
    unit_price = DecimalField(
        "Unit Price", places=2, validators=[DataRequired(), NumberRange(min=0)]
    )
    submit = SubmitField("Add Item")