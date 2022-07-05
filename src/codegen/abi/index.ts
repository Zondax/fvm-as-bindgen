import { FunctionABI, ParamsABI, ReturnABI } from './types.js'

export const generateFuncAbi = (funcName: string, params: ParamsABI[], ret: ReturnABI[]): FunctionABI => {
    return {
        name: funcName,
        type: 'function',
        params,
        return: ret,
    }
}
