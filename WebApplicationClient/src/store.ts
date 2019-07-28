import { createStore, combineReducers } from 'redux'
import { GameObjectReducer, GameObjectState } from './reducers/gameObjectReducer'

export interface AppState {
  gameObject: GameObjectState
}

const configureStore = () => {
  const _store = createStore(
    combineReducers<AppState>({
      gameObject: GameObjectReducer
    }),
    {},
  )

  return _store
}

const store = configureStore()

export default store