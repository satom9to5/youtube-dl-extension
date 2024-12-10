type RuntimeMessage = {
  type: string,
  data: GetTasksByIdsData 
}

type GetTasksByIdsData = string[]

type FromRuntimeMessage = {
  type: string,
  data: any
}
