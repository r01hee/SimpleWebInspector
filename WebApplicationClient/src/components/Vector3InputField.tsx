
import * as React from 'react'
import { WithStyles, withStyles, createStyles } from '@material-ui/core'
import { Theme } from '@material-ui/core/styles/createMuiTheme'

import TextField from '@material-ui/core/TextField'

import Field from '../models/NumberField'

const styles = (theme: Theme) => {
    return createStyles({
        textField: {
          marginLeft: theme.spacing.unit,
          marginRight: theme.spacing.unit,
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
  const {classes, onChange, onBlur, label, fields} = props

  const textFields = coordinateNames.map((n, i) => {
    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(i, event);
    }, [onChange]);

    const handleBlur = React.useCallback(() => {
      onBlur(coordinateNames[i], fields && fields[i]);
    }, [onBlur]);

    const handleKeyPress = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        onBlur(coordinateNames[i], fields && fields[i]);
        event.preventDefault();
      }
    }, [onBlur]);

    return (<TextField
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      key={i}
      label={n}
      className={classes.textField}
      value={fields ? fields[i].valueStr : ""}
      error={fields ? fields[i].error : false}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      margin="normal"
    />);
  });

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
