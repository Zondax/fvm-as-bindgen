import { ArgumentABI, ParamsType } from '../abi/types.js'
import { getNewIndexLetter } from './utils.js'

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's']

export function getCborDecode(fields: string[], entryFieldName: string): [string[], string[], ArgumentABI[]] {
    const result: string[] = []
    const paramsAbi: ArgumentABI[] = []

    const fieldsToCall: string[] = []
    fields.forEach((field, index) => {
        const [name, typeAndDefault] = field.split(':').map((val) => val.trim())
        const [type, defaultValue] = typeAndDefault.split('=').map((val) => val.trim())

        decodeTypes(result, 'array', entryFieldName, name, type, index.toString(), false)

        fieldsToCall.push(name)
        paramsAbi.push({ name, type: type as ParamsType, defaultValue })
    })

    return [result, fieldsToCall, paramsAbi]
}

export function decodeTypes(
    result: string[],
    parentType: string,
    parentName: string,
    fieldName: string,
    fieldType: string,
    rootIndex: string,
    isFieldReference: boolean
) {
    const [parseVarLine, decodeRecursively] = translateBasicTypes(parentName, parentType, rootIndex, fieldType, isFieldReference)
    if (parseVarLine != '' && !decodeRecursively) {
        result.push(`let ${fieldName} = ${parseVarLine}`)
        return
    }

    if (fieldType.startsWith('Array')) {
        const searchResult = new RegExp(/<.*>/).exec(fieldType)
        if (!searchResult) throw new Error(`type ${fieldType} is not well formatted to be an array`)

        const aux = searchResult[0].toString()
        const elementType = aux.substring(1, aux.length - 1)

        let accessor = getAccessor(parentName, parentType, rootIndex || fieldName, isFieldReference)
        result.push(`let ${fieldName}_raw = (${accessor} as Arr).valueOf()`)
        result.push(`let ${fieldName} = new Array<${elementType}>()`)

        let newIndex = getNewIndexLetter(result)
        result.push(`for(let ${newIndex} = 0; ${newIndex} < ${fieldName}_raw.length; ${newIndex}++){`)

        decodeTypes(result, 'array', `${fieldName}_raw`, `${fieldName}_raw_${newIndex}`, elementType, newIndex, true)

        result.push(`${fieldName}.push(${fieldName}_raw_${newIndex})`)
        result.push(`}`)
        return
    }

    if (fieldType.startsWith('Map')) {
        const searchResult = new RegExp(/<.*>/).exec(fieldType)
        if (!searchResult) throw new Error(`type ${fieldType} is not well formatted to be a map`)

        const typeFound = searchResult[0].toString()
        const [keyTypeRaw, ...valueTypeRest] = typeFound.substring(1, typeFound.length - 1).split(',')
        const keyType = keyTypeRaw.trim()
        const valueType = valueTypeRest.join(',').trim()

        let accessor = getAccessor(parentName, parentType, rootIndex || fieldName, isFieldReference)
        result.push(`let ${fieldName}_raw = (${accessor} as Obj).valueOf()`)
        result.push(`let ${fieldName}_keys =  ${fieldName}_raw.keys()`)
        result.push(`let ${fieldName} = new Map<${keyType}, ${valueType}>()`)

        let newIndex = getNewIndexLetter(result)
        result.push(`for(let ${newIndex} = 0; ${newIndex} < ${fieldName}_keys.length; ${newIndex}++){`)
        result.push(`let key_${newIndex} = ${fieldName}_keys.at(${newIndex})`)
        result.push(`let parsed_key_${newIndex} = ${castType('string', keyType, `key_${newIndex}`)}`)

        decodeTypes(result, 'map', `${fieldName}_raw`, `${fieldName}_raw_${newIndex}`, valueType, `parsed_key_${newIndex}`, true)

        result.push(`${fieldName}.set(parsed_key_${newIndex}, ${fieldName}_raw_${newIndex})`)
        result.push(`}`)
        return
    }

    let accessor = getAccessor(parentName, parentType, rootIndex || fieldName, false)
    result.push(`let ${fieldName} = ${fieldType}.parse(${accessor})`)

    //throw new Error(`type [${fieldType}] is not supported for decoding`)
}

function translateBasicTypes(
    parentName: string,
    parentType: string,
    fieldName: string,
    fieldType: string,
    isFieldReference: boolean
): [string, boolean] {
    let accessor = getAccessor(parentName, parentType, fieldName, isFieldReference)

    switch (fieldType) {
        case 'u64':
        case 'u32':
        case 'u16':
        case 'u8':
        case 'i64':
        case 'i32':
        case 'i16':
        case 'i8':
            return [`${fieldType}((${accessor} as Integer).valueOf())`, false]

        case 'f64':
        case 'f32':
            return [`${fieldType}((${accessor} as Float).valueOf())`, false]

        case 'string':
            return [`(${accessor} as Str).valueOf()`, false]

        case 'boolean':
            return [`(${accessor} as Bool).valueOf()`, false]

        case 'null':
            return [`(${accessor} as Null).valueOf()`, false]

        case 'Uint8Array':
            return [`(${accessor} as Bytes).valueOf()`, false]
    }

    if (fieldType.startsWith('Array')) return [`(${accessor} as Arr).valueOf()`, true]

    if (fieldType.startsWith('Map')) return [`(${accessor} as Obj).valueOf()`, true]

    return ['', false]
}

function getAccessor(parentName: string, parentType: string, fieldName: string, isFieldReference: boolean) {
    switch (parentType.toLowerCase()) {
        case 'map':
            if (isFieldReference) return `${parentName}.get(${fieldName})`
            return `${parentName}.get("${fieldName}")`

        case 'array':
            return `${parentName}.at(${fieldName})`

        default:
            return ''
    }
}

function castType(sourceType: string, destinationType: string, variableName: string) {
    sourceType = sourceType.toLowerCase().trim()
    destinationType = destinationType.trim()

    if (sourceType == 'string') {
        if (destinationType.startsWith('u') || destinationType.startsWith('i'))
            return `${destinationType}(Number.parseInt(${variableName}, 10))`
        if (destinationType.startsWith('float')) return `${destinationType}(Number.parseFloat(${variableName}, 10))`
        if (destinationType == 'string') return variableName
    }

    if (sourceType.startsWith('u') || sourceType.startsWith('i') || sourceType.startsWith('float')) {
        if (destinationType == 'string') return `${variableName}.toString()`
        if (destinationType.startsWith('u') || destinationType.startsWith('i') || destinationType.startsWith('float')) return variableName
    }

    throw new Error(`parse ${sourceType} to ${destinationType} not implemented`)
}
