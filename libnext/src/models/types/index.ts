import { PrimitiveLiteral } from "./primitive-literals";
import { PrimitiveType } from "./primitive-types";
import { CustomPrimitiveType } from "./custom-primitive-types";
import { ObjectType, ArrayType } from "./object-types";
import { ReferenceType, UnionType } from "./special-types";

export * from "./kinds";
export * from "./primitive-types";
export * from "./primitive-literals";
export * from "./custom-primitive-types";
export * from "./special-types";
export * from "./object-types";

export type DataType =
  | PrimitiveType
  | PrimitiveLiteral
  | CustomPrimitiveType
  | ObjectType
  | ArrayType
  | ReferenceType
  | UnionType;
