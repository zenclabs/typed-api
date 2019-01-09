import { Type, TypeGuards, TypeNode, UnionTypeNode } from "ts-simple-ast";
import {
  NULL,
  BOOLEAN,
  STRING,
  NUMBER,
  booleanLiteral,
  stringLiteral,
  unionType,
  arrayType,
  DataType,
  objectType,
  ObjectTypeProperty,
  ObjectType,
  numberLiteral,
  referenceType,
  DATE,
  DATETIME,
  INTEGER,
  ReferenceType,
  Kind,
  PrimitiveLiteral,
  NumberType,
  IntegerType,
  StringType,
  DateType,
  DateTimeType,
  BooleanType,
  NullType
} from "../../models/types";
import { last } from "lodash";
import {
  extractJsDocComment,
  extractPropertySignature,
  getTypeAliasDeclarationFromTypeReference
} from "./parser-utility";

/**
 * Convert an AST type node to a local data type.
 *
 * @param type AST type node
 */
export function parseType(typeNode: TypeNode): DataType {
  const type = typeNode.getType();

  if (type.isNull()) {
    return parseNull(typeNode);
  } else if (type.isBoolean()) {
    return parseBoolean(typeNode);
  } else if (type.isString()) {
    return parseString(typeNode);
  } else if (type.isNumber()) {
    return parseNumber(typeNode);
  } else if (type.isLiteral()) {
    return parseLiteralType(typeNode);
  } else if (type.isObject()) {
    return parseObjectTypes(typeNode);
  } else if (TypeGuards.isUnionTypeNode(typeNode)) {
    return parseUnionType(typeNode);
  } else {
    throw new Error("unknown type");
  }
}

function parseNull(typeNode: TypeNode): ReferenceType | NullType {
  const type = typeNode.getType();
  if (!type.isNull()) {
    throw new Error("expected null");
  }
  if (TypeGuards.isTypeReferenceNode(typeNode)) {
    const typeAliasDeclaration = getTypeAliasDeclarationFromTypeReference(
      typeNode
    );
    const name = typeAliasDeclaration.getName();
    const location = typeAliasDeclaration.getSourceFile().getFilePath();
    return referenceType(
      name,
      location,
      parseType(typeAliasDeclaration.getTypeNodeOrThrow()).kind
    );
  } else {
    return NULL;
  }
}

function parseBoolean(typeNode: TypeNode): ReferenceType | BooleanType {
  const type = typeNode.getType();
  if (!type.isBoolean()) {
    throw new Error("expected null");
  }
  if (TypeGuards.isTypeReferenceNode(typeNode)) {
    const typeAliasDeclaration = getTypeAliasDeclarationFromTypeReference(
      typeNode
    );
    const name = typeAliasDeclaration.getName();
    const location = typeAliasDeclaration.getSourceFile().getFilePath();
    return referenceType(
      name,
      location,
      parseType(typeAliasDeclaration.getTypeNodeOrThrow()).kind
    );
  } else {
    return BOOLEAN;
  }
}

function parseString(
  typeNode: TypeNode
): ReferenceType | StringType | DateType | DateTimeType {
  const type = typeNode.getType();
  if (!type.isString()) {
    throw new Error("expected null");
  }
  if (TypeGuards.isTypeReferenceNode(typeNode)) {
    const typeAliasDeclaration = getTypeAliasDeclarationFromTypeReference(
      typeNode
    );
    const name = typeAliasDeclaration.getName();
    // TODO: type alias of another type alias?
    switch (name) {
      case "Date": {
        return DATE;
      }
      case "DateTime": {
        return DATETIME;
      }
      default: {
        return referenceType(
          name,
          typeAliasDeclaration.getSourceFile().getFilePath(),
          parseType(typeAliasDeclaration.getTypeNodeOrThrow()).kind
        );
      }
    }
  } else {
    return STRING;
  }
}

function parseNumber(
  typeNode: TypeNode
): ReferenceType | NumberType | IntegerType {
  const type = typeNode.getType();
  if (!type.isNumber()) {
    throw new Error("expected null");
  }
  if (TypeGuards.isTypeReferenceNode(typeNode)) {
    const typeAliasDeclaration = getTypeAliasDeclarationFromTypeReference(
      typeNode
    );
    const name = typeAliasDeclaration.getName();
    switch (name) {
      case "Integer": {
        return INTEGER;
      }
      default: {
        return referenceType(
          name,
          typeAliasDeclaration.getSourceFile().getFilePath(),
          parseType(typeAliasDeclaration.getTypeNodeOrThrow()).kind
        );
      }
    }
  } else {
    return NUMBER;
  }
}

/**
 * AST literal types include literal booleans, strings and numbers.
 *
 * @param type AST type node
 */
function parseLiteralType(
  typeNode: TypeNode
): ReferenceType | PrimitiveLiteral {
  if (TypeGuards.isTypeReferenceNode(typeNode)) {
    const typeAliasDeclaration = getTypeAliasDeclarationFromTypeReference(
      typeNode
    );
    const name = typeAliasDeclaration.getName();
    const location = typeAliasDeclaration.getSourceFile().getFilePath();
    return referenceType(
      name,
      location,
      parseType(typeAliasDeclaration.getTypeNodeOrThrow()).kind
    );
  }
  return parseTargetLiteralType(typeNode.getType());
}

function parseTargetLiteralType(type: Type): PrimitiveLiteral {
  if (type.isBooleanLiteral()) {
    return booleanLiteral(type.getText() === "true");
  } else if (type.isStringLiteral()) {
    return stringLiteral(type.getText().substr(1, type.getText().length - 2));
  } else if (type.isNumberLiteral()) {
    return numberLiteral(Number(type.getText()));
  } else {
    throw new Error("expected an AST literal type");
  }
}

/**
 * AST object types include interfaces, arrays and object literals.
 *
 * @param type AST type node
 */
function parseObjectTypes(typeNode: TypeNode): DataType {
  const type = typeNode.getType();
  if (type.isInterface()) {
    return parseInterfaceType(type);
  } else if (TypeGuards.isArrayTypeNode(typeNode)) {
    return arrayType(parseType(typeNode.getElementTypeNode()));
  } else if (type.isObject()) {
    return parseObjectLiteralType(type);
  } else {
    throw new Error("expected an AST object type");
  }
}

function parseInterfaceType(type: Type): ReferenceType {
  if (!type.isInterface()) {
    throw new Error("expected interface type");
  }
  // TODO: how to handle if type aliased?
  const declarations = type.getSymbolOrThrow().getDeclarations();
  if (declarations.length !== 1) {
    throw new Error("expected exactly one interface declaration");
  }
  const interfaceDeclaration = declarations[0];
  if (!TypeGuards.isInterfaceDeclaration(interfaceDeclaration)) {
    throw new Error("expected an interface declaration");
  }
  const interfaceName = interfaceDeclaration.getName();
  const location = interfaceDeclaration.getSourceFile().getFilePath();

  return referenceType(interfaceName, location, Kind.Object);
}

export function parseObjectLiteralType(type: Type): ObjectType {
  const objectProperties: ObjectTypeProperty[] = type
    .getProperties()
    .map(property => {
      const propertySignature = extractPropertySignature(property);
      return {
        name: propertySignature.getName(),
        description: extractJsDocComment(propertySignature),
        type: parseType(propertySignature.getTypeNodeOrThrow()),
        optional: propertySignature.hasQuestionToken()
      };
    });
  return objectType(objectProperties);
}

function parseUnionType(typeNode: UnionTypeNode): DataType {
  // TODO: support for type aliasing?
  const allowedUnionTargetTypes = typeNode
    .getTypeNodes()
    .filter(utype => !utype.getType().isUndefined());
  if (allowedUnionTargetTypes.length === 1) {
    // not a union
    return parseType(allowedUnionTargetTypes[0]);
  } else if (allowedUnionTargetTypes.length > 1) {
    return unionType(allowedUnionTargetTypes.map(utype => parseType(utype)));
  } else {
    throw new Error("union type error");
  }
}

// function parseCustomString(type: Type): DataType {
//   return customString({
//     pattern: extractStringValue(extractTypePropertyType(type, "pattern"))
//   });
// }

// function parseCustomNumber(type: Type): DataType {
//   return customNumber({
//     integer: extractBooleanValue(extractTypePropertyType(type, "integer")),
//     min: extractNumberValue(extractTypePropertyType(type, "min")),
//     max: extractNumberValue(extractTypePropertyType(type, "max"))
//   });
// }

// function extractTypePropertyType(type: Type, propertyName: string): Type {
//   const property = type.getProperty(propertyName);
//   if (property) {
//     return extractPropertySignature(property).getType();
//   } else {
//     throw new Error(`expected property "${propertyName}" from interface`);
//   }
// }

// function extractBooleanValue(type: Type): boolean | undefined {
//   if (type.isBoolean()) {
//     return undefined;
//   } else if (type.isBooleanLiteral()) {
//     return type.getText() === "true";
//   } else {
//     throw new Error("expected property to be a boolean");
//   }
// }

function extractStringValue(type: Type): string | undefined {
  if (type.isString()) {
    return undefined;
  } else if (type.isStringLiteral()) {
    return type.getText().substr(1, type.getText().length - 2);
  } else {
    throw new Error("expected property to be a string");
  }
}

function extractNumberValue(type: Type): number | undefined {
  if (type.isNumber()) {
    return undefined;
  } else if (type.isNumberLiteral()) {
    return Number(type.getText());
  } else {
    throw new Error("expected property to be a number");
  }
}

/**
 * Check if a type is a custom string.
 *
 * @param type type to check
 */
function typeIsCustomString(type: Type) {
  return type.isInterface() && typeIncludesBaseType(type, "CustomStringType");
}

/**
 * Check if a type is a custom number.
 *
 * @param type type to check
 */
function typeIsCustomNumber(type: Type) {
  return type.isInterface() && typeIncludesBaseType(type, "CustomNumberType");
}

/**
 * Check if a type has a base type of a certain name.
 *
 * @param type type to check
 * @param typeName name of type to check for
 */
function typeIncludesBaseType(type: Type, typeName: string) {
  return type
    .getBaseTypes()
    .some(baseType => last(baseType.getText().split(".")) === typeName);
}
