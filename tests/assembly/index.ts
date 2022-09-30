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
}

@export_method(3)
function move(x:u8, y:u8): void {

}
