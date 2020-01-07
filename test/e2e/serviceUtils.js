import pickBy from 'lodash/pickBy'
import { spawnSync } from 'child_process'

export const runService = async (serviceName, options) => {
  const env = {
    ...process.env,
    IS_TESTING: 'test'
  }
  const processOptions = pickBy(
    {
      stdio: options.showOutput ? 'inherit' : undefined,
      env
    },
    Boolean
  )
  const res = spawnSync('node', [`build/${serviceName}`], processOptions)

  if (res.status !== 0) {
    throw new Error(`Error while running ${serviceName}`)
  }
}
