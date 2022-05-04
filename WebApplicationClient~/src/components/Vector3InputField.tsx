
import * as React from 'react'
import { WithStyles, withStyles, createStyles } from '@material-ui/core'
import { Theme } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField'

import Field from '../models/NumberField'

const styles = (theme: Theme) => {
    return createStyles({
        textField: {
          marginLeft: theme.spacing(),
          marginRight: theme.spacing(),
          width: 200,
        },
        container: {
          display: 'flex',
          flexWrap: 'wrap',
        },
        formHeader: {
          marginTop: 15,
          marginBottom: 0,
        },
    })
}

interface Props extends WithStyles<typeof styles>
{
  onChange: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (coordinate: string, field: Field | null) => void
  label: string
  fields: Field[] | null
}


const coordinateNames = ["X", "Y", "Z"];

const Vector3InputField: React.FC<Props>  = (props: Props) => {
  const {classes, onChange, onBlur, label, fields} = props;

  const changeHandles = React.useMemo(() => coordinateNames.map((_, i) =>
    (event: React.ChangeEvent<HTMLInputElement>) => onChange(i, event)
  ), [onChange]);

  const blurHandles = React.useMemo(() => coordinateNames.map((n, i) =>
    () => onBlur(n, fields && fields[i])
  ), [onBlur, fields]);

  const keyPressHandles = React.useMemo(() => coordinateNames.map((n, i) =>
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        onBlur(n, fields && fields[i]);
        event.preventDefault();
      }
    }
  ), [onBlur, fields]);

  const textFields = coordinateNames.map((n, i) =>
    <TextField
      onBlur={blurHandles[i]}
      onKeyPress={keyPressHandles[i]}
      key={i}
      label={n}
      className={classes.textField}
      value={fields ? fields[i].valueStr : ""}
      error={fields ? fields[i].error : false}
      onChange={changeHandles[i]}
      InputLabelProps={{ shrink: true }}
      margin="normal"
    />);

  return (
    <div>
      <h6 className={classes.formHeader}>{label}</h6>
      <form className={classes.container} noValidate={true} autoComplete="off">
        {textFields}
      </form>
    </div>
  );
}

export default withStyles(styles)(Vector3InputField) 
