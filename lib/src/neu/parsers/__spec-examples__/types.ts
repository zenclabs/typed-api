import {
  Date,
  DateTime,
  Double,
  Float,
  Int32,
  Int64,
  Integer,
  Number,
  String
} from "@airtasker/spot";

interface TypeInterface {
  null: null;
  boolean: boolean;
  true: true;
  false: false;
  string: string;
  String: String;
  literalString: "literalString";
  number: number;
  Number: Number;
  Float: Float;
  Double: Double;
  literalFloat: 1.02;
  Integer: Integer;
  Int32: Int32;
  Int64: Int64;
  literalInteger: 2;
  Date: Date;
  DateTime: DateTime;
  literalObject: {
    propertyA: string;
    propertyB?: boolean;
  };
  array: boolean[];
  Array: Array<{ a: boolean }>;
  union: boolean | Date | null;
  unionDiscriminated: DiscriminatedUnionElementA | DiscriminatedUnionElementB;
  unionDiscriminatedNullable:
    | DiscriminatedUnionElementA
    | DiscriminatedUnionElementB
    | null;
  unionWithDuplicate: string | string; // TODO: test
  unionWithAliasedDuplicate: string | AliasString; // TODO: test
  unionWithNestedDuplicate: string | StringBooleanUnion; // TODO: test
  alias: AliasString;
  interface: Interface;
  interfaceExtends: InterfaceExtends;
  indexedAccess: IndexedAccess["root"];
  indexedAccessNested: IndexedAccess["child"]["nested"]["secondNest"];
  indexedIndexedAccess: IndexedAccess["indexed"]["root"];
  indexedAccessInline: { root: boolean }["root"];
  enum: Enum;
  enumConstant: Enum.A;
  map: Map<string, boolean>;
  indexSignature: { [index: string]: boolean };
  interfaceWithIndexSignature: InterfaceWithIndexSignature;
}

interface DiscriminatedUnionElementA {
  type: "a";
  a: string;
}

interface DiscriminatedUnionElementB {
  type: "b";
  b: string;
}

type AliasString = string;

type StringBooleanUnion = string | boolean;

interface Interface {
  interfaceProperty: boolean;
}

interface InterfaceExtends extends Interface {
  interfaceExtendsProperty: boolean;
}

interface InterfaceWithIndexSignature {
  [index: string]: boolean;
}

interface IndexedAccess {
  root: boolean;
  child: {
    nested: {
      secondNest: boolean;
    };
  };
  indexed: IndexedIndexedAccess;
}

interface IndexedIndexedAccess {
  root: boolean;
}

enum Enum {
  A,
  B,
  C
}
