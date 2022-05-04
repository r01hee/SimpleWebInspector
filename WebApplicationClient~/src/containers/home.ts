import { Action } from 'typescript-fsa'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { AppState } from '../store'
import { GameObjectActions } from '../actions/GameObjectAction'
import HomeComponent from '../components/home'
import GameObjectItem from '../models/GameObjectItem'
import GameObject from '../models/GameObject'
import Vector3FieldsPayload from '../models/Vector3FieldsPayload'

export interface HomeActions {
  handleSetGameObjects: (gameObject: GameObject[]) => Action<GameObject[]>
  handleUpdateGameObjects: (gameObject: GameObject[]) => Action<GameObject[]>
  handleRefreshGameObjects: (gameObject: GameObject[]) => Action<GameObject[]>
  handleSelectGameObject: (id: number | null) => Action<number | null>
  handleExpandGameObject: (gameObject: GameObjectItem) => Action<GameObjectItem>
  handleChangeLocalPositionFields: (payload: Vector3FieldsPayload) => Action<Vector3FieldsPayload>
  handleChangeLocalRotationFields: (payload: Vector3FieldsPayload) => Action<Vector3FieldsPayload>
  handleChangeScaleFields: (payload: Vector3FieldsPayload) => Action<Vector3FieldsPayload>
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    handleSetGameObjects: (gameObjects: GameObject[]) => dispatch(GameObjectActions.set(gameObjects)),
    handleUpdateGameObjects: (gameObjects: GameObject[]) => dispatch(GameObjectActions.update(gameObjects)),
    handleRefreshGameObjects: (gameObjects: GameObject[]) => dispatch(GameObjectActions.refresh(gameObjects)),
    handleSelectGameObject: (id: number | null) => dispatch(GameObjectActions.select(id)),
    handleExpandGameObject: (gameObject: GameObjectItem) => dispatch(GameObjectActions.expand(gameObject)),
    handleChangeLocalPositionFields: (payload: Vector3FieldsPayload) => dispatch(GameObjectActions.changeLocalPositionField(payload)),
    handleChangeLocalRotationFields: (payload: Vector3FieldsPayload) => dispatch(GameObjectActions.changeLocalRotationField(payload)),
    handleChangeScaleFields: (payload: Vector3FieldsPayload) => dispatch(GameObjectActions.changeScaleField(payload)),
  }
}

const mapStateToProps = (appState: AppState) => {
  return Object.assign({}, appState)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeComponent)