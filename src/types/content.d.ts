type ManipulateElement = {
  element: Element,
  manipulate: manipulationConfig.Manipulate
}

type VideoIdTargets = {
  [key: string]: ManipulateElement[];
}
