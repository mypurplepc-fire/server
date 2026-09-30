from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email


class SupplierForm(FlaskForm):
    name = StringField("Supplier Name", validators=[DataRequired()])
    contact_person = StringField("Contact Person")
    phone = StringField("Phone")
    email = StringField("Email", validators=[Email()])
    address = TextAreaField("Address")
    submit = SubmitField("Save")