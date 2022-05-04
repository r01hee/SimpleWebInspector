import actionCreatorFactory from 'typescript-fsa'

import GameObject from '../models/GameObject'
import GameObjectItem from '../models/GameObjectItem'
import Vector3FieldPayload from '../models/Vector3FieldsPayload';

const actionCreator = actionCreatorFactory()

export const GameObjectActions = {
  set: actionCreator<GameObject[]>('SET_GAME_OBJECTS'),
  update: actionCreator<GameObject[]>('UPDATE_GAME_OBJECTS'),
  refresh: actionCreator<GameObject[]>('REFRESH_GAME_OBJECTS'),
  select: actionCreator<number | null>('SELECT_GAME_OBJECT'),
  expand: actionCreator<GameObjectItem>('EXPAND_GAME_OBJECT_CHILDREN'),
  changeLocalPositionField: actionCreator<Vector3FieldPayload>('CHANGE_GAME_OBJECT_LOCAL_POSITION_FIELD'),
  changeLocalRotationField: actionCreator<Vector3FieldPayload>('CHANGE_GAME_OBJECT_LOCAL_ROTATION_FIELD'),
  changeScaleField: actionCreator<Vector3FieldPayload>('CHANGE_GAME_OBJECT_SCALE_FIELD')
}