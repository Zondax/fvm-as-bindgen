import { Source, FunctionDeclaration, ClassDeclaration, FieldDeclaration } from "assemblyscript"
import {
    importsInvoke, toString, isFunction, isClass, getInvokeFunc, VALID_RETURN_TYPES, isField, isMethod
} from "./utils.js";
import {encode, getCborEncode} from "./cbor/encoding.js";
import {constructorFunc, staticFuncs, getStateFunc} from "./state/index.js";
import {decode} from "./cbor/decoding.js";
import {getReturnParser} from "./return/index.js";

export class Builder{
    sb: string[]
    constructor() {
        this.sb = []
    }

    build(source: Source): [string, boolean] {
        if( source.text.includes("@chainfile-index") )
            return [this.processIndexFile(source), true]
        if( source.text.includes("@chainfile-state") )
            return [this.processStateFile(source), false]

        return [toString(source), false]
    }

    private processIndexFile(source: Source): string {
        this.sb.push(getInvokeFunc())
        this.sb.push(importsInvoke())

        let invokeCustomMethods: string[] = []
        const indexesUsed: {[key:string]: boolean} = {}

        let sourceText = source.statements.map((stmt) => {
            if (isFunction(stmt)) {
                const _stmt = stmt as FunctionDeclaration
                const decorator = _stmt.decorators ? _stmt.decorators.find(dec => toString(dec.name) == "export_method") : undefined
                if (decorator) {
                    const args = decorator.args

                    if(!args
                        || args.length > 1
                        || isNaN(parseInt(toString(args[0])))
                    ) throw new Error("export_method decorator requires only one integer value as argument")

                    const indexStr = toString(args[0])
                    if(parseInt(indexStr) < 2) throw new Error("export_method decorator index should be higher than 1")
                    if(indexesUsed[indexStr]) throw new Error(`export_method decorator index ${indexStr} is duplicated`)

                    indexesUsed[indexStr] = true

                    if( _stmt.signature.parameters.length != 1 )
                        throw new Error(`exported method has an invalid arguments amount. Only a Value is allowed`)

                    if( toString(_stmt.signature.parameters[0].type) != "Value" )
                        throw new Error(`exported method has an invalid argument type [${toString(_stmt.signature.parameters[0].type)}] --> valid one: [Value]`)

                    const funcCall = `__wrapper_${_stmt.name.text}(paramsID)`
                    const funcSignature = `__wrapper_${_stmt.name.text}(paramsID: u32)`
                    const returnCall = `__encodeReturn_${_stmt.name.text}`

                    const returnTypeStr = toString(_stmt.signature.returnType)

                    invokeCustomMethods.push(`case ${indexStr}:`)
                    switch (returnTypeStr){
                        case "void":
                            invokeCustomMethods.push(`${funcCall}`)
                            invokeCustomMethods.push(`case ${indexStr}:return NO_DATA_BLOCK_ID`)

                            this.sb.push(`
                                function ${funcSignature}:void {
                                    ${_stmt.name.text}(decodeParamsRaw(paramsRaw(paramsID)))
                                }
                            `)
                            break
                        default:
                            invokeCustomMethods.push(`const result = ${funcCall}`)
                            invokeCustomMethods.push(`return create(DAG_CBOR, result)`)

                            this.sb.push(`
                                function ${funcSignature}:Uint8Array {
                                    const result = ${_stmt.name.text}(decodeParamsRaw(paramsRaw(paramsID)))
                                    
                                    return ${returnCall}(result) 
                                }
                                ${getReturnParser(returnCall, "result", returnTypeStr)}
                            `)
                            break
                    }

                }

                if (
                    _stmt.decorators
                    &&  _stmt.decorators.some(dec => toString(dec.name) == "constructor")
                ) {
                    this.sb[0] = this.sb[0].replace("__constructor-func__", `${_stmt.name.text}(decoded)`)
                }
            }
            return toString(stmt);
        })

        this.sb[0] = this.sb[0].replace("__user-methods__", invokeCustomMethods.join("\n"))

        let str = sourceText.concat(this.sb).join("\n")
        return str
    }

    processStateFile(source: Source): string {
        let importsToAdd :string[] = []

        let sourceText = source.statements.map((stmt) => {

            if(isClass(stmt)){
                let _stmt = stmt as ClassDeclaration

                // Remove base functions from base state class
                const decorator_1 = _stmt.decorators ? _stmt.decorators.find(dec => toString(dec.name) == "base_state") : undefined
                if (decorator_1) {
                    _stmt.members = _stmt.members.filter(mem => {
                        if(isMethod(mem)){
                            const _mem = mem as FunctionDeclaration
                            return toString(_mem.name) != "save" && toString(_mem.name) != "load"
                        }
                        return true
                    })
                    let classStr = toString(stmt)
                    return classStr
                }

                const decorator_2 = _stmt.decorators ? _stmt.decorators.find(dec => toString(dec.name) == "state") : undefined
                if (decorator_2) {
                    // Encode func
                    const fields = _stmt.members.filter(mem => isField(mem)).map(field => toString(field as FieldDeclaration))
                    const encodeFunc = encode(fields).join("\n")
                    const decodeFunc = decode(toString(_stmt.name), fields).join("\n")
                    const constFunc = constructorFunc(fields)
                    const defaultFunc = staticFuncs(toString(_stmt.name), fields)

                    // Base func
                    const [ imports, funcs ] = getStateFunc(toString(_stmt.name))
                    importsToAdd.push(imports)

                    let classStr = toString(stmt)
                    classStr = classStr.slice(0, classStr.lastIndexOf("}"));
                    classStr += `
                        ${constFunc}
                        ${defaultFunc}
                        ${encodeFunc}
                        ${decodeFunc}
                        ${funcs}
                    }`;

                    return classStr
                }
            }

            return toString(stmt);
        })

        let str = importsToAdd.concat(sourceText.concat(this.sb)).join("\n")
        return str
    }
}
