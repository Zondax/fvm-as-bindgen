import { FieldABI, FunctionABI, ParamsABI, ReturnABI } from './types.js'

export const generateFuncAbi = (funcName: string, params: ParamsABI[], ret: ReturnABI[]): FunctionABI => {
    return {
        name: funcName,
        type: 'function',
        params,
        return: ret,
    }
}

export const generateFieldAbi = (funcName: string, params: ParamsABI[]): FieldABI => {
    return {
        name: funcName,
        type: 'field_type',
        params,
    }
}
