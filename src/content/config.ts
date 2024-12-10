import manipulationYml from '@config/manipulation.yml'

const config: manipulationConfig.ManipulationConfig = {...manipulationYml}
config.url.regexp = new RegExp(config.url.pattern)

Object.freeze(config)
export default config
