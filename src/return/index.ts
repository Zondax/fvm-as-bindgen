import {getCborEncode} from "../cbor/encoding.js";

export function getReturnParser(funcName:string, returnVarName: string, returnType:string):string{
    let sb: string[] = []
    sb.push(`function ${funcName}(${returnVarName}: ${returnType}):${returnType === "void" ? "void": "Uint8Array"}{`)

    switch (returnType){
        case "CBOREncoder":
            sb.push(`return Uint8Array.wrap(${returnVarName}.serialize())`)
            break
        case "Uint8Array":
            sb.push(`return ${returnVarName}`)
            break
        case "void":
            sb.push(`return`)
            break
        default:
            sb = sb.concat(getCborEncode([`${returnVarName}:${returnType}`], false))
            sb.push(`return Uint8Array.wrap(encoder.serialize())`)
            break;
    }
    sb.push(`}`)

    return sb.join("\n")
}