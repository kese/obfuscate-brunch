const obfuscator = require('javascript-obfuscator')
const { assign } = Object
// TODO: remap existing sourcemaps
// const transfer = require('multi-stage-sourcemap')

class Obfuscator {

    constructor(config = {}) {
        this.options = assign({ sourceMap: !!config.sourceMaps },
            (config.plugins || {}).obfuscate || {})
    }

    optimize(file) {
        const { data, map, path } = file // for map -> see TODO
        if (this.options.ignored && this.options.ignored.test(path))
            return this.ignore(data, map, path)

        try {
            return Promise.resolve(this.obfuscate(data, map, path))
        } catch(err) {
            return Promise.reject(`JS obfuscation failed on ${path}: ${err}`)
        }
    }

    ignore(data, map, path)  {
        try {
            const ignored = assign({ data }, map ? { map: map.toString() } : {})
            return Promise.resolve(ignored)
        }  catch (err) {
            return Promise.reject(`error ignoring file ${path}: ${err}`)
        }
    }

    obfuscate(data, map, path) {
        const result = obfuscator.obfuscate(data, this.options)
        return assign({ data: result.getObfuscatedCode() },
            !this.options.sourceMap ? {} : { map: result.getSourceMap() })
    }
}

Object.assign(Obfuscator.prototype, {
    brunchPlugin: true,
    type: 'javascript'
})

module.exports = Obfuscator
