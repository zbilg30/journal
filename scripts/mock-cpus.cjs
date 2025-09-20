const os = require('os')
const originalCpus = os.cpus
os.cpus = function mockCpus() {
  const result = typeof originalCpus === 'function' ? originalCpus.call(os) : []
  if (Array.isArray(result) && result.length > 0) {
    return result
  }
  return [{}]
}
