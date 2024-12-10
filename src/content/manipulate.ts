export function addTargetClass(manipulateElement: ManipulateElement): void {
  const { element, manipulate } = manipulateElement

  manipulate.currents.forEach((targetAction: manipulationConfig.TargetAction) => {
    if (!element.parentNode) {
      return
    }

    if (targetAction.selector && element.parentNode.querySelector(targetAction.selector) !== element) {
      return
    }

    element.classList.add('youtube-dl-queueing')
  })

  manipulate.children.forEach((targetAction: manipulationConfig.TargetAction) => {
    if (!targetAction.selector) {
      return
    }

    Array.from(element.querySelectorAll(targetAction.selector)).forEach((child: Element) => {
      child.classList.add('youtube-dl-queueing')
    })
  })
}

export function removeTargetClass(element: Element, manipulate: manipulationConfig.Manipulate): void {
  manipulate.currents.forEach((targetAction: manipulationConfig.TargetAction) => {
    const targetElements: Element[] = currentTargetElements(element, targetAction);

    targetElements.forEach(targetElement => {
      targetElement.classList.remove('youtube-dl-queueing');
    });
  })

  manipulate.children.forEach((targetAction: manipulationConfig.TargetAction) => {
    const targetElements: Element[] = childrenTargetElements(element, targetAction);

    targetElements.forEach(targetElement => {
      targetElement.classList.remove('youtube-dl-queueing');
    });
  })
}

function currentTargetElements(element: Element, targetAction: manipulationConfig.TargetAction): Element[] {
  return (
    element.parentNode && 
    ((targetAction.selector && element.parentNode.querySelector(targetAction.selector) == element) || !targetAction.selector)
  ) ? [element] : [];
}

function childrenTargetElements(element: Element, targetAction: manipulationConfig.TargetAction): Element[] {
  return Array.from(element.querySelectorAll(targetAction.selector));
}
