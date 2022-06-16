import { Source, FunctionDeclaration } from "assemblyscript"
import {
    importsInvoke,
    toString,
    isFunction,
    getInvokeFunc
} from "./utils.js";

export class Builder{
    static build(source: Source): [string, boolean] {
        let str = toString(source)

        const isFilecoinFile = source.text.includes("@filecoinfile");
        if(isFilecoinFile) {
            let invokeFunc = getInvokeFunc()
            let invokeCustomMethods = ""
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

                        const isVoid = toString(_stmt.signature.returnType) === "void"
                        const callSignature = `${_stmt.name.text}(paramsID)`

                        invokeCustomMethods += `
                            case ${indexStr}:
                                ${ isVoid 
                                    ? `${callSignature}
                                        return NO_DATA_BLOCK_ID`
                                    : `const result = ${callSignature}
                                        return result`
                                }
                        `
                    }

                    if (
                        _stmt.decorators
                        &&  _stmt.decorators.some(dec => toString(dec.name) == "constructor")
                    ) {
                        invokeFunc = invokeFunc.replace("__constructor-name-func__", _stmt.name.text)
                    }
                }

                return toString(stmt);
            })

            str =       sourceText.join("\n")
                    + "\n" + importsInvoke()
                    + "\n" + invokeFunc.replace("__user-methods__", invokeCustomMethods)
        }

        return [str, isFilecoinFile]
    }
}
