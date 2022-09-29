import { BaseState } from '@zondax/fvm-as-sdk/assembly/utils/state'

// This class represents the actor state.
// The BaseState is an abstract class. It has logic to read and write data to storage.

// @ts-ignore
@state

// @ts-ignore
export class State extends BaseState {
    /*
  Define your fields to save here

  Some examples:

  message: string;
  count: u64;
  array: Array<u64>;
  map: Map<string, u64>;
  */
    message: string
    u_count_1: u8
    u_count_2: u16
    u_count_3: u32
    u_count_4: u64
    i_count_1: i8
    i_count_2: i16
    i_count_3: i32
    i_count_4: i64
    table_nested_1: Array<u64>
    table_nested_2: Array<Array<u64>>
    table_nested_3: Array<Array<Array<u64>>>
    table_nested_4: Array<Array<Array<Array<u64>>>>
    table_nested_5: Array<Array<Array<Array<string>>>>
    players_nested_1: Map<string, boolean>
    players_nested_2: Map<string, Map<string, boolean>>
}
