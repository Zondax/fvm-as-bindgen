import { getCborDecode } from '../cbor/decoding.js'
import { getCborEncode } from '../cbor/encoding.js'
import { getDefaultValue } from './utils.js'

export function getStateDecodeFunc(className: string, fields: string[]) {
    let result: string[] = []
    result.push(`protected parse(raw: Value): ${className} {`)
    result.push(`if( !raw.isArr ) throw new Error("raw state should be an array")`)
    result.push(`let state = (raw as Arr).valueOf()`)

    const [extraLines, fieldsToCall, paramsAbi] = getCborDecode(fields, 'state')
    result = result.concat(extraLines)

    result.push(`return new State(${fieldsToCall.join(',')})`)
    result.push('}')

    return result
}

export function getStateEncodeFunc(fields: string[]) {
    let result: string[] = []
    result.push(`protected encode(): ArrayBuffer {`)
    result = result.concat(getCborEncode(fields, 'this'))
    result.push('return encoder.serialize()')
    result.push('}')

    return result
}

export const getStateStaticFuncs = (stateClassName: string, fields: string[], enableLogs: boolean): string => {
    const func = `static defaultState(): ${stateClassName} {
        return new ${stateClassName}( __params__ );
      }
      
      static load(): ${stateClassName} {
        const state = State.defaultState().load() as ${stateClassName};
        ${
            enableLogs
                ? `
        const stateToLog = new CBORDecoder( state.encode() ).parse().toString()
        log("Current state: [" + stateToLog + "]")`
                : ''
        }
        return state;
      }`

    let args = ''

    fields.forEach((field) => {
        const [name, typeAndDefault] = field.split(':').map((val) => val.trim())
        const [type, defaultVal] = typeAndDefault.split('=').map((val) => val.trim())

        let val = defaultVal
        if (val === undefined) val = getDefaultValue(type)

        args += `${val}, `
    })

    return func.replace('__params__', args)
}
