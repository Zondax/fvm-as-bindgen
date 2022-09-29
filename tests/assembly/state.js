var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BaseState } from "@zondax/fvm-as-sdk/assembly/utils/state";
// This class represents the actor state.
// The BaseState is an abstract class. It has logic to read and write data to storage.
// @ts-ignore
let State = 
// @ts-ignore
class State extends BaseState {
    /*
    Define your fields to save here
  
    Some examples:
  
    message: string;
    count: u64;
    array: Array<u64>;
    map: Map<string, u64>;
    */
    table;
    players;
};
State = __decorate([
    state
    // @ts-ignore
], State);
export { State };
