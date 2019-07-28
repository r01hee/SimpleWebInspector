import { Action } from 'typescript-fsa'
import * as React from 'react'
import { WithStyles, withStyles, createStyles } from '@material-ui/core'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import RefreshIcon from '@material-ui/icons/Refresh'
import Drawer from "@material-ui/core/Drawer"

import { HomeActions } from '../containers/home'
import { AppState } from '../store'
interface OwnProps {}

import Vector3InputField from './Vector3InputField'
import GameObjectList from './GameObjectList'

import GameObjectItem from '../models/GameObjectItem'
import GameObject from '../models/GameObject'
import TransformElement from '../models/TransformElement'
import Field from '../models/NumberField'

import * as api from '../helpers/api'

import Vector3FieldsPayload from '../models/Vector3FieldsPayload'

const drawerWidth = 240;

const styles = (theme: Theme) => {
    return createStyles({
        appBar: {
          zIndex: theme.zIndex.drawer + 1,
        },
        button: {
          margin: theme.spacing.unit
        },
        toolbar: theme.mixins.toolbar,
        root: {
          display: 'flex',
        },
        drawer: {
          width: drawerWidth,
          flexShrink: 0,
        },
        drawerPaper: {
          width: drawerWidth,
        },
        container: {
          display: 'flex',
          flexWrap: 'wrap',
        },
        formControl: {
          margin: theme.spacing.unit,
        },
        content: {
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
          padding: theme.spacing.unit * 3,
          paddingTop: "109px"
        },
        formHeader: {
          marginTop: 0,
          marginBottom: 10,
        },
        textField: {
          marginLeft: theme.spacing.unit,
          marginRight: theme.spacing.unit,
          width: 200,
        },
  })
}

const makeHandleChangeVector3Field = (handleChange: (payload: Vector3FieldsPayload) => Action<Vector3FieldsPayload>) =>
{
  return (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const payload = {
        index: index,
        value: event.target.value
      } as Vector3FieldsPayload
      handleChange(payload)
    };
}

const makeHandleBlurVector3Field = (selectedGameObject: GameObjectItem | undefined, name: string, handleUpdateGameObjects: (gameObject: GameObject[]) => Action<GameObject[]>) =>
{
  if (selectedGameObject === undefined) {
    return (coordinate: string, field: Field | null) => undefined;
  }

  return (coordinate: string, field: Field | null) => {
    if (field === null || field.error) {
      return;
    }
    const transform = {
      coordinate: coordinate,
      instanceId: selectedGameObject.instanceId,
      name: name,
      value: field.value
    } as TransformElement;

    api.putGameObjectTransforms([transform], (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      const gameObjects = res.body.objects as GameObject[]
      handleUpdateGameObjects(gameObjects);
    })
  };
}

type Props = OwnProps & AppState & HomeActions & WithStyles<typeof styles>

const HomeComponent: React.FC<Props> = (props: Props) => {
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    api.getGameObjectsList((err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      const gameObjects = res.body.objects as GameObject[];
      props.handleSetGameObjects(gameObjects)
    })
  }, [rootRef])

  const handleClickRefreshButton = React.useCallback(() => {
    api.getGameObjectsList((err, res) => {
        if (err) {
          console.error(err);
          return;
        }

        const gameObjects = res.body.objects as GameObject[];
        props.handleRefreshGameObjects(gameObjects);
      })
  }, [rootRef]);

  const handleExpand = React.useCallback((field: GameObjectItem) => {
    props.handleExpandGameObject(field)
  },[rootRef])

  const { classes } = props

  const selectedGameObject = props.gameObject.gameObjectItems.find(g => g.instanceId === props.gameObject.selectedId)

  const handleClickGameObject = React.useCallback((gameObject: GameObjectItem) => {
    props.handleSelectGameObject(gameObject.instanceId);
  }, [rootRef]);

  const handleChangePosition = React.useCallback(makeHandleChangeVector3Field(props.handleChangeLocalPositionFields), [rootRef])
  const handleChangeRotation= React.useCallback(makeHandleChangeVector3Field(props.handleChangeLocalRotationFields), [rootRef])
  const handleChangeScale = React.useCallback(makeHandleChangeVector3Field(props.handleChangeScaleFields), [rootRef])

  const handleBlurLocalPosition = React.useCallback(makeHandleBlurVector3Field(selectedGameObject, "localPosition", props.handleUpdateGameObjects), [selectedGameObject]);
  const handleBlurLocalRotation = React.useCallback(makeHandleBlurVector3Field(selectedGameObject, "localRotation", props.handleUpdateGameObjects), [selectedGameObject]);
  const handleBlurScale = React.useCallback(makeHandleBlurVector3Field(selectedGameObject, "localScale", props.handleUpdateGameObjects), [selectedGameObject]);

  const targetIds = props.gameObject.gameObjectItems.filter(g => !g.hasParent).map(g => g.instanceId);
  return (
    <div ref={rootRef} className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton className={classes.button} color='inherit' aria-label="Refresh" onClick={handleClickRefreshButton} >
            <RefreshIcon color='inherit' />
          </IconButton>
          <Typography color='inherit'>Simple Web Inspector</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" className={classes.drawer} classes={{paper: classes.drawerPaper}} open={true}>
        <div className={classes.toolbar} />
        <GameObjectList gameObjects={props.gameObject.gameObjectItems} targetIds={targetIds} onExpand={handleExpand} selectedId={props.gameObject.selectedId} onClick={handleClickGameObject} nestCount={0} />
      </Drawer>
      <main className={classes.content}>
        <Vector3InputField label="Position" fields={props.gameObject.localPositionFields} onChange={handleChangePosition} onBlur={handleBlurLocalPosition} />
        <Vector3InputField label="Rotation" fields={props.gameObject.localRotationFields} onChange={handleChangeRotation} onBlur={handleBlurLocalRotation} />
        <Vector3InputField label="Scale" fields={props.gameObject.localScaleFields} onChange={handleChangeScale} onBlur={handleBlurScale} />
      </main>
    </div>
  )
}

export default withStyles(styles)(HomeComponent) 
