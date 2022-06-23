/*const letters = ["a","b","c","d","e","f","g","h","i","j","k"]

export function encode(className: string, fields: string[]){
    const result: string[] = []
    result.push(`protected parse(raw: Value): ${className} {`)
    result.push(`if( !raw.isObj ) throw new Error("raw state should be an object")`)
    result.push(`let state = raw as Obj`)

    const fieldsForState: string[] = []
    fields.forEach( field => {
        const [name, type] = field.split(":")
        decodeTypes(result, "object","state", name.trim(), type.trim(), "")
    })

    result.push(`return new State(${fieldsForState.join(",")})`)
    result.push("}")

    return result
}

export function decodeTypes(result: string[], parentType: string, parentName:string, fieldName: string, type: string, indexName: string){
    result.push(`if( !rawStateObj.has("${fieldName}") ) throw new Error("state should contain the key ${fieldName}")`)
    const index = indexName != "" ? `[${indexName}]` : ""

    switch (type){
        case "u64":
        case "u32":
        case "u16":
        case "u8":
        case "i64":
        case "i32":
        case "i16":
        case "i8":
            result.push(`${type}((state.get("${fieldName}") as Integer).valueOf())`)
            break

        case "f64":
        case "f32":
            result.push(`${type}((state.get("${fieldName}") as Float).valueOf())`)
            break

        case "string":
            result.push(`(state.get("${fieldName}") as String).valueOf()`)
            break

        case "boolean":
            result.push(`(state.get("${fieldName}") as Boolean).valueOf()`)
            break

        case "null":
            result.push(`(state.get("${fieldName}") as Null).valueOf()`)
            break

        default:
            if( type.startsWith("Array") ){
                const arrayType = type.split("<")[1].split(">")[0]

                result.push(`encoder.addArray("${fieldName}", this.${fieldName}.length)`)
                let newIndex = getNewIndexLetter(result, indexName)
                result.push(`for(let ${newIndex} = 0; ${newIndex} < this.${fieldName}.length; ${newIndex}++){`)
                encodeTypes(result, arrayType, fieldName, newIndex)
                result.push(`}`)
            }
    }
}

export function getNewIndexLetter(result: string[], currentLetter: string){
    if(currentLetter == "") return letters[0]

    let isUsed = true, i = 0, newLetter = ""
    while(isUsed && i != letters.length) {
        i++
        newLetter = letters[i]
        isUsed = result.some(line => line.includes(`let ${newLetter}`))
    }

    if( i == letters.length ) throw new Error("no more indexes to use")
    return newLetter
}
*/
