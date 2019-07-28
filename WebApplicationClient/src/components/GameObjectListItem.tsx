import * as React from 'react'
import { WithStyles, withStyles, createStyles } from '@material-ui/core'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import ArrowRight from '@material-ui/icons/ArrowRight'
import ArrowDropDown from '@material-ui/icons/ArrowDropDown'
import Icon from '@material-ui/core/Icon';

import GameObjectItem from '../models/GameObjectItem'

const styles = (theme: Theme) => {
    return createStyles({
        expandButton: {
          padding: '0px',
        },
        gameObjectButton: {
          marginRight: '0px',
          padding: '0px',
        },
        gameObjectListItemText: {
          padding: '0px',
        },
        listItemIcon: {
          marginRight: '0px',
        },
        gameObjectText: {
          justifyContent: 'normal',
          textTransform: 'none',
        },
    })
}

interface Props extends WithStyles<typeof styles>
{
  onExpand: (gameObject: GameObjectItem) => void;
  onClick: (gameObject: GameObjectItem) => void;
  gameObject: GameObjectItem;
  isSelected: boolean;
}

const GameObjectListItem: React.FC<Props> = ({gameObject, onExpand, onClick, isSelected, classes}: Props) => {

  const handleExpand = React.useCallback(() => {
    onExpand(gameObject);
  },[gameObject, onExpand])

  const handleClick = React.useCallback(() => {
    onClick(gameObject)
  },[gameObject, onClick])

  const buttonClasses = React.useMemo(() => ({label: classes.gameObjectText}), [classes.gameObjectText]);

  const hasChildren = gameObject.childInstanceIds.length !== 0 
  return (
    <ListItem style={isSelected ? {'backgroundColor': '#d0d0d0'} : undefined } >
        <ListItemIcon className={classes.listItemIcon}>
          <IconButton className={classes.expandButton} onClick={handleExpand} disabled={!hasChildren}>
            {hasChildren ? (gameObject.expanded ? <ArrowDropDown /> : <ArrowRight />) : <Icon />}
          </IconButton>
        </ListItemIcon>
      <ListItemText className={classes.gameObjectListItemText}>
        <Button className={classes.gameObjectButton} onClick={handleClick} classes={buttonClasses}>
          {gameObject.name}
        </Button>
      </ListItemText>
    </ListItem>
  )
}


export default withStyles(styles)(GameObjectListItem) 