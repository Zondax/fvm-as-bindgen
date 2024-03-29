import { FieldABI, FunctionABI, ArgumentABI, ReturnABI, ABI } from './types.js'

export const ABI_VERSION = '0.1.0'

export const generateConstructorAbi = (paramsAbi: ArgumentABI[]) => {
    return generateFuncAbi('new', parseInt('1'), paramsAbi, [{ type: 'string' }, { type: 'string' }])
}

export const generateFuncAbi = (funcName: string, methodNum: number, args: ArgumentABI[], ret: ReturnABI[]): FunctionABI => {
    return {
        name: funcName,
        type: 'function',
        index: methodNum,
        args,
        return: ret,
    }
}

export const generateFieldAbi = (funcName: string, fields: ArgumentABI[]): FieldABI => {
    return {
        name: funcName,
        type: 'object',
        fields,
    }
}
