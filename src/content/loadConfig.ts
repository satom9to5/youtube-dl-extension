import manipulationYml from '@config/manipulation.yml'

export default (): manipulationConfig.ManipulationConfig => {
  const config: manipulationConfig.ManipulationConfig = {...manipulationYml}

  config.url.regexp = new RegExp(config.url.pattern)

  return config
}
