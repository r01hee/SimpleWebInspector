import { reducerWithInitialState } from 'typescript-fsa-reducers'
import { GameObjectActions } from '../actions/GameObjectAction'

import GameObjectItem from '../models/GameObjectItem'
import NumberField from '../models/NumberField'

import Vector3FieldsPayload from 'src/models/Vector3FieldsPayload';
import Vector3 from 'src/models/Vector3';

export interface GameObjectState {
  gameObjectItems: GameObjectItem[],
  selectedId: number | null,
  localPositionFields: NumberField[] | null,
  localRotationFields: NumberField[] | null,
  localScaleFields: NumberField[] | null,
}

const initialState: GameObjectState = {
  gameObjectItems: [],
  selectedId: null,
  localPositionFields: null,
  localRotationFields: null,
  localScaleFields: null,
}

const changeFields = (state: GameObjectState, payload: Vector3FieldsPayload, fields: NumberField[] | null) => {
  const { index, value } = payload;

  if (fields === null) {
    return state;
  }

  fields[index].valueStr = value;

  return Object.assign({}, state);
}

const vector3ToNumberFields = (vector3: Vector3) =>
{
  return [
    new NumberField(vector3.x),
    new NumberField(vector3.y),
    new NumberField(vector3.z),
  ] as NumberField[];
}

export const GameObjectReducer = reducerWithInitialState(initialState)
.case(GameObjectActions.set, (state, gameObjects) =>
  Object.assign({}, state, {
    gameObjectItems: gameObjects.map(g => new GameObjectItem(g)),
    localPositionFields: null,
    localRotationFields: null,
    localScaleFields: null,
  })
)
.case(GameObjectActions.update, (state, gameObjects) => {
  for (const g of gameObjects) {
    const index = state.gameObjectItems.findIndex(x => x.instanceId === g.instanceId)
    if (index === undefined) {
      continue;
    }
    state.gameObjectItems[index].AssignTransform(g);
  }
  return Object.assign({}, state)
})
.case(GameObjectActions.refresh, (state, gameObjects) => {
  const gameObjectItems = state.gameObjectItems.filter(i => gameObjects.some(g => g.instanceId === i.instanceId));

  for (const g of gameObjects) {
    const index = gameObjectItems.findIndex(i => i.instanceId === g.instanceId)
    if (index < 0) {
      gameObjectItems.push(new GameObjectItem(g));
      continue;
    }
    gameObjectItems[index] = gameObjectItems[index].MakeMerged(g);
  }

  const selectedGameObject = gameObjectItems.find(g => g.instanceId === state.selectedId);
  return Object.assign({}, state, {
    gameObjectItems: gameObjectItems,
    localPositionFields: selectedGameObject ? vector3ToNumberFields(selectedGameObject.localPosition) : null,
    localRotationFields: selectedGameObject ? vector3ToNumberFields(selectedGameObject.localRotation) : null,
    localScaleFields: selectedGameObject ? vector3ToNumberFields(selectedGameObject.localScale) : null,
  })
})
.case(GameObjectActions.select, (state, id) => {
  const gameObject = state.gameObjectItems.find(g => g.instanceId === id);
  if (gameObject === undefined) {
    return state;
  }

  return Object.assign({}, state, {
    selectedId: id,
    localPositionFields: vector3ToNumberFields(gameObject.localPosition),
    localRotationFields: vector3ToNumberFields(gameObject.localRotation),
    localScaleFields: vector3ToNumberFields(gameObject.localScale),
  });
})
.case(GameObjectActions.expand, (state, gameObject) => {
  const target = state.gameObjectItems.find(g => g.instanceId === gameObject.instanceId)
  if (target === undefined) {
     return state;
  }
  target.expanded = !target.expanded
  return Object.assign({}, state)
})
.case(GameObjectActions.changeLocalPositionField, (state, payload) => 
  changeFields(state, payload, state.localPositionFields)
)
.case(GameObjectActions.changeLocalRotationField, (state, payload) => 
  changeFields(state, payload, state.localRotationFields)
)
.case(GameObjectActions.changeScaleField, (state, payload) => 
  changeFields(state, payload, state.localScaleFields)
)