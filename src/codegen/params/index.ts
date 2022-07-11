import { getCborDecode } from '../cbor/decoding.js'
import { ArgumentABI } from '../abi/types.js'

export function getParamsDecodeLines(fields: string[], enableLogs: boolean): [string[], string[], ArgumentABI[]] {
    let result: string[] = []

    if (enableLogs) result.push(`log("Rcv params --> " + decoded.stringify())`)

    result.push(`if( !decoded.isArr ) throw new Error("params rcv should be encoded in a CBOR array")`)
    result.push(`let arrParams = (decoded as Arr).valueOf()`)

    const [extraLines, fieldsToCall, paramsAbi] = getCborDecode(fields, 'arrParams')
    result = result.concat(extraLines)

    return [result, fieldsToCall, paramsAbi]
}
