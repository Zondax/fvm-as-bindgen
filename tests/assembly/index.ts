import {State} from "./state";
import {wrappers} from "@zondax/fvm-as-sdk/assembly"

// @ts-ignore
@constructor
function init(): void {
  // If we want to attach some storage to the instance,
  // a state needs to be saved at this step.
  // So we create a store, and call save method

  // @ts-ignore
  State.defaultState().save()
}

// User function. Smart-contract-related function.
// @ts-ignore
@export_method(2)
function play(): void {

    // @ts-ignore
    const state = State.load() as State;

    if(state.players_nested_1.keys().length > 2){
        wrappers.genericAbort(100, "the game is full")
        return
    }

    if(state.players_nested_1.has(wrappers.caller().toString())){
        wrappers.genericAbort(101, "you already are part of the game")
        return
    }

    state.players_nested_1.set(wrappers.caller().toString(), true)
    state.save()
}

@export_method(3)
function move(x:u8, y:u8): void {
    // @ts-ignore
    const state = State.load() as State;


    if( !state.players_nested_1.has(wrappers.caller().toString())){
        wrappers.genericAbort(101, "you are not part of the game")
        return
    }

    if( state.players_nested_1.keys().length != 2){
        wrappers.genericAbort(101, "the players are not ready")
        return
    }

    if( x > 3 || y > 3){
        wrappers.genericAbort(101, "the position is not valid")
        return
    }
}
