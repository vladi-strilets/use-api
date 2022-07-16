import { AxiosRequestConfig } from 'axios'
import { ConfigureOptions, makeUseAxios, Options, UseAxios } from 'axios-hooks'
import './App.css'

type UseApiOptions<Response = any, Body = any> = {
  manual?: boolean
  useAxiosOptions?: Options
  axiosRequestConfig?: AxiosRequestConfig<Body>
}

export type MakeRoute = <ResponseOne, ResponseMany, Create, Update, Remove>() => <T extends string>(
  path: T
) => T

type MakeUseApiConfig<T> = {
  routes: MakeRoute[]
  makeUseAxiosConfig: ConfigureOptions
}

type SimpleId = string | number
type ObjectId = { id: SimpleId }
type AdvancedId = SimpleId | ObjectId

type GetOne = 'getOne'
type GetMany = 'getMany'
type Create = 'create'
type Update = 'update'
type Remove = 'remove'

type EndpointType = GetOne | GetMany | Create | Update | Remove
type MergedType<Base extends string, Type extends string> = `${Base}.${Type}`
type PathEndpoints<T extends string> = MergedType<T, EndpointType>

type EndpointConfig = {
  axiosConfig: AxiosRequestConfig
  useAxiosOptions?: Options
}

type EndpointsMap = {
  [key in EndpointType]: (...args: any[]) => EndpointConfig
}

type UseApiResults<Response = any> = {
  data: Response
  loading: boolean
  error: any
  execute: () => void
}

const getOne = (path: string, id: SimpleId): EndpointConfig => ({
  axiosConfig: { method: 'GET', url: `/${path}/${id}` },
  useAxiosOptions: { manual: false },
})

const getMany = (path: string): EndpointConfig => ({
  axiosConfig: { method: 'GET', url: `/${path}` },
  useAxiosOptions: { manual: false },
})

const create = (path: string): EndpointConfig => ({
  axiosConfig: { method: 'POST', url: `/${path}` },
  useAxiosOptions: { manual: true },
})

const update = (path: string, id: SimpleId): EndpointConfig => ({
  axiosConfig: { method: 'PUT', url: `/${path}/${id}` },
  useAxiosOptions: { manual: true },
})

const remove = (path: string, id: SimpleId): EndpointConfig => ({
  axiosConfig: { method: 'DELETE', url: `/${path}/${id}` },
  useAxiosOptions: { manual: true },
})

export const makeUseApi = <T extends string>(makeUseApiConfig: MakeUseApiConfig<T>) => {
  const { makeUseAxiosConfig } = makeUseApiConfig
  const useAxios = makeUseAxios(makeUseAxiosConfig)

  const endpointsMap: EndpointsMap = {
    getOne,
    getMany,
    create,
    update,
    remove,
  }

  function useApi(path: MergedType<T, GetOne>, id: AdvancedId): UseApiResults
  function useApi(path: MergedType<T, GetMany>): UseApiResults
  function useApi(path: MergedType<T, Create>): UseApiResults
  function useApi(path: MergedType<T, Update>, id: AdvancedId): UseApiResults
  function useApi(path: MergedType<T, Remove>, id: AdvancedId): UseApiResults
  function useApi(path: PathEndpoints<T>, id?: AdvancedId): UseApiResults {
    const [basePath, endpointType] = path.split('.') as [string, EndpointType]

    const endpointGeneratorParams = [basePath, typeof id === 'object' ? id.id : id]
    const endpointConfig = endpointsMap[endpointType](...endpointGeneratorParams)

    const { axiosConfig, useAxiosOptions } = endpointConfig

    const [{ data, loading, error }, execute] = useAxios(axiosConfig, useAxiosOptions)

    return { data, loading, error, execute }
  }

  return useApi
}

type Paths = { [key: string]: string }

class CreateUseApi {
  useAxios: UseAxios
  paths: Paths = {}

  constructor(makeUseAxiosConfig: ConfigureOptions) {
    this.useAxios = makeUseAxios(makeUseAxiosConfig)
  }

  addPath<Response, Body>(path: string) {
    this.paths[path] = path
  }

  getOne() {
    return this.paths
  }
}

class CreateApi {
  private endpoints: any = {} // type?

  addEndpoint<Data>(key: string) {
    this.endpoints[key] = key // how can we assign 'Data' type to the specific key
  }

  getOne(key: string) {
    const data = {} // here the data should be of type 'Data', based on the selected key
    return data
  }
}

type User = { id: string }

const api = new CreateApi()
api.addEndpoint<User>('users') // we can add as many endpoints as we need

const data = api.getOne('users') // data should be of type 'User' without forcing it

export default CreateUseApi
