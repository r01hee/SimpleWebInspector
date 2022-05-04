import * as React from 'react'
import { WithStyles, withStyles, createStyles } from '@material-ui/core'
import { Theme } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import ArrowRight from '@material-ui/icons/ArrowRight'

const styles = (theme: Theme) => {
    return createStyles({
        button: {
          'text-transform': 'none'
        }
    })
}

interface Props extends WithStyles<typeof styles>
{
    onExpand: () => void;
    onClick: () => void;
    text: string;
}

const GameObject: React.FC<Props> = ({classes, onExpand, onClick, text}: Props) => (
  <ListItem>
    <ListItemIcon>
      <IconButton onClick={onExpand}>
        <ArrowRight />
      </IconButton>
    </ListItemIcon>
    <ListItemText>
      <Button className={classes.button} onClick={onClick}>{text}</Button>
    </ListItemText>
  </ListItem>
)

export default withStyles(styles)(GameObject) 