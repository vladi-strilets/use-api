import axios from 'axios'
import React from 'react'
import './App.css'
import { MakeRoute, makeUseApi, Route } from './useApi'

type User = {
  id: string
  name: string
}

const makeRoute: MakeRoute = () => (path) => path

type UsersResponseOne = {
  id: string
}

const axiosInstance = axios.create({ baseURL: 'https://jsonplaceholder.typicode.com' })
const routes = [
  makeRoute<User, User, User, User, User, 'users'>,
  makeRoute<User, User, User, User, User, 'todos'>,
]
// const routes = ['users', 'todos'] as const

// type Mutable<T> = {
//   -readonly [K in keyof T]: Mutable<T[K]>
// }

// const routes = [{ path: 'users' }, { path: 'todos' }]
// type ImmutableArr = Readonly<typeof routes>
// type MutableArr = Mutable<ImmutableArr>
// type Arr = Mutable<typeof routes>

// const x: MutableArr = [{ path: 'users' }, { path: 'todos' }]

const useApi = makeUseApi({
  routes,
  makeUseAxiosConfig: {
    axios: axiosInstance,
  },
})

// const useApi = new makeUseApi({axios: axiosInstance})

const App = () => {
  const { data, loading, execute } = useApi('users.getOne', 1)
  // const { data, loading, execute } = useApi.getOne('todos', 1)

  return (
    <div className="App">
      <header className="App-header">
        <p>{JSON.stringify(data)}</p>
        <p>{`${loading}`}</p>
        <button onClick={execute}>Click</button>
      </header>
    </div>
  )
}

export default App
