from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField, DateField, SubmitField
from wtforms.validators import DataRequired


class ProjectForm(FlaskForm):
    name = StringField("Project Name", validators=[DataRequired()])
    client_name = StringField("Client Name")
    location = StringField("Location")
    budget = DecimalField("Budget", places=2)
    start_date = DateField("Start Date")
    end_date = DateField("End Date")
    submit = SubmitField("Save")