export const getStateFunc = (stateClassName: string) => {
    const imports = `
        import {CBOREncoder, CBORDecoder} from "@zondax/assemblyscript-cbor/assembly"
        
        import {Cid, DAG_CBOR} from "@zondax/fvm-as-sdk/assembly/env";
        import {Get, Put, root} from "@zondax/fvm-as-sdk/assembly/helpers";
        import {setRoot} from "@zondax/fvm-as-sdk/assembly/wrappers";
    `

    const func = `
    
    // Function responsible to serialize state and save it to IPLD
    save(): Cid{
        // Call encode function to serialize data to ArrayBuffer
        const encodedData = Uint8Array.wrap(this.encode())

        // Create a new block on IPLD with serialized data
        // It returns the id of that new block
        const stCid = Put(0xb220, 32, DAG_CBOR, encodedData)

        // setRoot allows to attach that new block to the actor instance that is running
        // If this is not done, the block won't be related to this actor, and it won't be able
        // to access it
        setRoot(stCid)

        return stCid
    }

    // Function used to load the state attached or related to this actor instance
    protected load(): ${stateClassName}{
        // Get the block id related to this instance
        const readCid = root()

        // Using that id, get the block and read the serialized data
        const ipldData = Get(readCid)

        // Use CBORDecoder to CBOR data into an object
        const decoder = new CBORDecoder(ipldData.buffer)

        // Call custom function to get State from generic object
        const rawState = decoder.parse()

        return this.parse(rawState)
    }
    `

    return [imports, func]
}
