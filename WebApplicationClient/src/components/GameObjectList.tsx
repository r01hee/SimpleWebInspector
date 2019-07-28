import * as React from 'react'
import { WithStyles, withStyles, createStyles } from '@material-ui/core'
import { Theme } from '@material-ui/core/styles/createMuiTheme'

import Collapse from '@material-ui/core/Collapse'
import List from '@material-ui/core/List'

import GameObjectItem from '../models/GameObjectItem'
import GameObjectListItem from './GameObjectListItem'

const styles = (theme: Theme) => {
    return createStyles({
        list: {
          'paddingLeft': '1em',
        }
    })
}

interface Props extends WithStyles<typeof styles>
{
    gameObjects: GameObjectItem[];
    targetIds: number[];
    onExpand: (gameObject: GameObjectItem) => void;
    onClick: (gameObject: GameObjectItem) => void;
    nestCount: number
    selectedId: number | null
}

const GameObjectList: React.FC<Props>  = (props: Props) => {
  const {onExpand, onClick, gameObjects, targetIds, nestCount, selectedId, classes} = props

  const ref = React.useRef<HTMLDivElement>(null)

  const handleExpand = React.useCallback((gameObject: GameObjectItem) => {
    onExpand(gameObject)
  },[ref])

  const handleClick = React.useCallback((gameObject: GameObjectItem) => {
    onClick(gameObject)
  }, [ref])

  return (
    <List className={classes.list}>
      {gameObjects.filter(g => targetIds.includes(g.instanceId)).map(g => {
        const childProps = Object.assign({}, props, {targetIds: g.childInstanceIds, nestCount: nestCount+1})
        return (<div key={g.instanceId}>
          <GameObjectListItem isSelected={g.instanceId === selectedId} gameObject={g} onExpand={handleExpand} onClick={handleClick} />
          {(g.childInstanceIds.length > 0) &&
            <Collapse in={g.expanded}>
              <GameObjectList {...childProps}  />
            </Collapse>}
        </div>)
      })}
    </List>
  )
}

export default withStyles(styles)(GameObjectList) 
