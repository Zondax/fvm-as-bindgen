import { Transform } from "assemblyscript/asc"
import { Parser, Source } from "assemblyscript"

import { filecoinFiles, posixRelativePath } from "./utils.js";

export class MyTransform extends Transform {
    parser: Parser | undefined;

    afterParse(parser: Parser){
        /*const srcs = parser.sources.filter(src => src.text.includes("function invoke")).map(src => src.statements.filter( stamt => stamt.kind == NodeKind.FUNCTIONDECLARATION ))
        srcs.forEach(stamts => {
            stamts.forEach(stamt =>
            console.log(ASTBuilder.build(stamt)))
        })*/

        this.parser = parser;

        const writeFile = this.writeFile;
        const baseDir = this.baseDir;

        let newParser = new Parser(parser.diagnostics);

        // Filter for filecoin files
        let files = filecoinFiles(parser.sources);

        // Visit each file
        files.forEach((source) => {
            if (source.internalPath.includes("index-stub")) return;
            let writeOut = /\/\/.*@filecoinfile .*out/.test(source.text);

            /*// Remove from logs in parser
            parser.donelog.delete(source.internalPath);
            parser.seenlog.delete(source.internalPath);

            // Remove from programs sources
            parser.sources = parser.sources.filter(
                (_source: Source) => _source !== source
            );
            this.program.sources = this.program.sources.filter(
                (_source: Source) => _source !== source
            );

            // Build new Source
            let sourceText = JSONBindingsBuilder.build(source);
            if (writeOut) {
                writeFile(
                    posixRelativePath("out", source.normalizedPath),
                    sourceText,
                    baseDir
                );
            }
            // Parses file and any new imports added to the source
            newParser.parseFile(
                sourceText,
                posixRelativePath(isEntry(source) ? "" : "./", source.normalizedPath),
                isEntry(source)
            );
            let newSource = newParser.sources.pop()!;
            this.program.sources.push(newSource);
            parser.donelog.add(source.internalPath);
            parser.seenlog.add(source.internalPath);
            parser.sources.push(newSource);*/
        });

    }
}



function createInvoke(){
    const baseFunc = `export function invoke(_: u32): u32 {

      // Read invoked method number
      const methodNum = methodNumber()
    
      switch (u32(methodNum)) {
        // Method number 1 is fixe for create actor command
        case 1:
          // Call constructor func.
          constructor()
          break
    
        // Any other method is defined by the user
        case 2:
          // Execute whatever the smart contract wants.
          const msg = say_hello()
    
          // If we want to return something as execution result,
          // we need to create a block with those values, and return
          // the output of that function
          return create(DAG_CBOR, msg)
    
        // If the method number is not implemented, an error should be retrieved
        default:
          usrUnhandledMsg()
      }
    
      return NO_DATA_BLOCK_ID
    }`
}
