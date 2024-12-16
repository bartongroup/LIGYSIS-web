from flask_wtf import FlaskForm
from wtforms import StringField, MultipleFileField, SubmitField


class LigysisForm(FlaskForm):
    uniprot_id = StringField('Enter UniProt ID')
    files = MultipleFileField('and upload mmCiF files')
    submit = SubmitField('Submit')

    # Custom validator
    def validate(self, extra_validators=None):
        # Use the default validate method first
        initial_validation = super(LigysisForm, self).validate(extra_validators=extra_validators)

        # If the initial validation passes and both parts have data, return True
        if initial_validation and (self.uniprot_id.data and self.files.data):
            return True

        # If either field is missing, add a form-wide error
        if not (self.uniprot_id.data and self.files.data):
            self.uniprot_id.errors.append('Please enter UniProt ID and upload mmCiF files.')
            return False

        return False

# TODO: Implement extendable form with optional fields
