type DefinedAction = {
  type: string;
  args: DefinedActionArg[];
}

type DefinedActionArg = {
  style: DefinedActionArgStyle | null;
}

type DefinedActionArgStyle = {
  color: string | null;
}

const actions = {
  popupInfo: (element: object, pathsInfo: string | null = null): DefinedAction[] => {
    return [
      {
        type: "attrs",
        args: [
          {
            style: {
              color: "green" // classに変更する
            }
          }
        ]
      },
    ]
  }
}

Object.freeze(actions)
export default actions
