from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    DecimalField,
    DateField,
    TextAreaField,
    SelectField,
    SubmitField,
)
from wtforms.validators import DataRequired, Optional, NumberRange


class CostEntryForm(FlaskForm):
    category = StringField("Category", validators=[DataRequired()])
    description = TextAreaField("Description")
    amount = DecimalField(
        "Amount",
        places=2,
        validators=[DataRequired(), NumberRange(min=0)],
    )
    entry_date = DateField("Date", validators=[DataRequired()])
    supplier_id = SelectField("Supplier", coerce=int, validators=[Optional()])
    submit = SubmitField("Add Cost")
