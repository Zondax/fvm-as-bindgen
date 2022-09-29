import { getNewIndexLetter } from './utils.js'

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's']

export function getCborEncode(fields: string[], parentName: string): string[] {
    const result: string[] = []
    result.push('const encoder = new CBOREncoder();')

    return result.concat(encodeFields(fields, parentName))
}

export function encodeFields(fields: string[], parentName: string) {
    const result: string[] = []
    result.push(`encoder.addArray(${fields.length})`)

    fields.forEach((field) => {
        const [name, typeAndDefault] = field.split(':')
        const [type, defaultVal] = typeAndDefault.split('=')

        encodeField(result, type.trim(), name.trim(), parentName, '', '')
    })

    return result
}

export function encodeField(result: string[], type: string, fieldName: string, parentName: string, indexType: string, indexName: string) {
    let index
    let fieldAccessor = `${parentName != '' ? `${parentName}.` : ''}${fieldName}`
    switch (indexType) {
        case 'array':
            index = `[${indexName}]`
            break
        case 'map':
            index = `.get(${indexName})`
            break
        default:
            index = ''
            break
    }

    let _type
    switch (type) {
        case 'u64':
        case 'u32':
        case 'u16':
        case 'u8':
            _type = type.replace('u', '')
            result.push(`encoder.addUint${_type}(${fieldAccessor}${index})`)
            break

        case 'i64':
        case 'i32':
        case 'i16':
        case 'i8':
            _type = type.replace('i', '')
            result.push(`encoder.addInt${_type}(${fieldAccessor}${index})`)
            break

        case 'f64':
        case 'f32':
            _type = type.replace('f', '')
            result.push(`encoder.addF${_type}(${fieldAccessor}${index})`)
            break

        case 'string':
            result.push(`encoder.addString(${fieldAccessor}${index})`)
            break

        case 'boolean':
            result.push(`encoder.addBoolean(${fieldAccessor}${index})`)
            break

        case 'null':
            result.push(`encoder.addNull(${fieldAccessor}${index})`)
            break

        case 'Uint8Array':
            result.push(`encoder.addBytes(${fieldAccessor}${index})`)
            break

        default:
            if (type.startsWith('Array')) {
                const searchResult = new RegExp(/<.*>/).exec(type)
                if (!searchResult) throw new Error(`type ${type} is not well formatted to be an array`)

                const parentType = searchResult[0].toString()
                const arrayType = parentType.substring(1, parentType.length - 1)

                result.push(`encoder.addArray(${fieldAccessor}${index}.length)`)
                let newIndex = getNewIndexLetter(result)
                result.push(`for(let ${newIndex} = 0; ${newIndex} < ${fieldAccessor}${index}.length; ${newIndex}++){`)
                encodeField(result, arrayType, `${fieldName}[${newIndex}]`, parentName, '', '')
                result.push(`}`)
                return
            }

            if (type.startsWith('Map')) {
                const searchResult = new RegExp(/<.*>/).exec(type)
                if (!searchResult) throw new Error(`type ${type} is not well formatted to be a map`)

                const parentType = searchResult[0].toString()
                const [keyType, valueType] = parentType.substring(1, parentType.length - 1).split(',', 2)

                let newIndex = getNewIndexLetter(result)
                result.push(`let keys_${newIndex} = ${fieldAccessor}${index}.keys()`)

                result.push(`encoder.addObject(keys_${newIndex}.length)`)

                result.push(`for(let ${newIndex} = 0; ${newIndex} < keys_${newIndex}.length; ${newIndex}++){`)
                result.push(`encoder.addKey(keys_${newIndex}[${newIndex}].toString())`)
                encodeField(result, valueType.trim(), fieldName, parentName, 'map', `keys_${newIndex}[${newIndex}]`)
                result.push(`}`)
                return
            }

            result.push(`${type}.encode(encoder, ${fieldAccessor}${index})`)
            return

            throw new Error(`type [${type}] is not supported for encoding`)
    }
}
