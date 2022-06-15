import path from "path"
import {NodeKind, SourceKind, CommonFlags, DeclarationStatement, Source, Node} from "assemblyscript"



const FILECOIN_DECORATOR = "filecoinBindgen";

export function filecoinFiles(sources: Source[]){
    return sources.filter(hasFilecoinDecorator)
}

function hasFilecoinDecorator(stmt: Source): boolean {
    const status =  (
        (isEntry(stmt) || stmt.text.includes("@filecoinfile") || false
            /*stmt.statements.some(
                (s:any) =>
                    s instanceof DeclarationStatement &&
                    utils.hasDecorator(s, FILECOIN_DECORATOR)
            )*/) &&
        !stmt.text.includes("@notFilecoinfile")
    );
    return status
}

export function isEntry(source: Source | Node): boolean {
    return source.range.source.sourceKind == SourceKind.USER_ENTRY;
}

function isClass(type: Node): boolean {
    return type.kind == NodeKind.CLASSDECLARATION;
}

function isField(mem: DeclarationStatement) {
    return mem.kind == NodeKind.FIELDDECLARATION;
}

function isStatic(mem: DeclarationStatement) {
    return mem.is(CommonFlags.STATIC);
}

function isEncodable(mem: DeclarationStatement) {
    return isField(mem) && !isStatic(mem);
}

export function posixRelativePath(from: string, to: string): string {
    const relativePath = path.relative(from, to);
    return relativePath.split(path.sep).join(path.posix.sep);
}
