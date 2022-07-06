export type ParamsType = 'u64' | 'u32' | 'u16' | 'u8' | 'i64' | 'i32' | 'i16' | 'i8' | 'string'

export type ReturnABI = {
    name: string
    type: ParamsType
}

export type ParamsABI = {
    name: string
    type: ParamsType
    defaultValue: string
}

export type FunctionABI = {
    type: 'function'
    name: string
    params: ParamsABI[]
    return: ReturnABI[]
}

export type FieldABI = {
    type: 'field_type'
    name: string
    params: ParamsABI[]
}

export type ABI = (FunctionABI | FieldABI)[]
