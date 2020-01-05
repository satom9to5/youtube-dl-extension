export function urlMatch(element: Element, config: manipulationConfig.ManipulationConfig, manipulate: manipulationConfig.Manipulate): string | null {
  if (!(config.url) || !(config.url.regexp) || !(config.url.matchnum)) {
    return null
  }

  if (!(manipulate.attributeName in element) || typeof element[manipulate.attributeName] != 'string') {
    return null
  }

  const path = element[manipulate.attributeName].replace(location.origin, '') 
  const matches = path.match(config.url.regexp)
  if (!matches || matches.length == 0) {
    return null
  }

  return matches[config.url.matchnum]
}
