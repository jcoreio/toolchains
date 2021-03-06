import Type from './Type';
import Validation, { ErrorTuple, IdentifierPath } from '../Validation';
export default class SymbolLiteralType<T extends symbol> extends Type<T> {
    typeName: string;
    readonly value: T;
    constructor(value: T);
    errors(validation: Validation<any>, path: IdentifierPath, input: any): Generator<ErrorTuple, void, void>;
    accepts(input: any): boolean;
    toString(): string;
}
