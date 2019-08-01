import assertNever from "assert-never";
import { flatten } from "lodash";
import { TypeNode } from "../models/nodes";
import { ObjectType, TypeKind, UnionType } from "../models/types";
import { resolveType } from "../verifiers/utilities/type-resolver";

/**
 * Recursively traverse the Types tree, find and group union types definitions into a flat array.
 */
export function extractNestedUnionTypes({
  type,
  name = ""
}: TypeNode): Array<TypeNode<UnionType>> {
  switch (type.kind) {
    case TypeKind.NULL:
    case TypeKind.BOOLEAN:
    case TypeKind.STRING:
    case TypeKind.FLOAT:
    case TypeKind.DOUBLE:
    case TypeKind.INT32:
    case TypeKind.INT64:
    case TypeKind.DATE:
    case TypeKind.DATE_TIME:
    case TypeKind.BOOLEAN_LITERAL:
    case TypeKind.STRING_LITERAL:
    case TypeKind.NUMBER_LITERAL:
    case TypeKind.TYPE_REFERENCE:
      return [];
    case TypeKind.OBJECT:
      return flatten(
        type.properties.map(property =>
          extractNestedUnionTypes({
            type: property.type,
            name: name + "." + property.name
          })
        )
      );
    case TypeKind.ARRAY:
      return extractNestedUnionTypes({ type: type.elements, name });
    case TypeKind.UNION:
      return flatten([
        {
          name,
          type
        },
        ...type.types.map((possibleType, index) =>
          extractNestedUnionTypes({
            type: possibleType,
            name: `${name}[${index}]`
          })
        )
      ]);
    default:
      throw assertNever(type);
  }
}

export function maybeResolveRef(
  typeNode: TypeNode,
  typeStore: TypeNode[]
): TypeNode {
  if (!typeStore.length) {
    return typeNode;
  }

  const unreferencedType = resolveType(typeNode.type, typeStore);

  return {
    name: typeNode.name,
    type: unreferencedType
  };
}

/**
 * Recursively traverse the Types tree, find and group union types definitions into a flat array.
 *
 * Note: Type references are not traversed.
 */
export function extractNestedObjectTypes(
  typeNode: TypeNode,
  typeStore: TypeNode[]
): Array<TypeNode<ObjectType>> {
  const { type, name } = typeNode;
  switch (type.kind) {
    case TypeKind.NULL:
    case TypeKind.BOOLEAN:
    case TypeKind.STRING:
    case TypeKind.FLOAT:
    case TypeKind.DOUBLE:
    case TypeKind.INT32:
    case TypeKind.INT64:
    case TypeKind.DATE:
    case TypeKind.DATE_TIME:
    case TypeKind.BOOLEAN_LITERAL:
    case TypeKind.STRING_LITERAL:
    case TypeKind.NUMBER_LITERAL:
      return [];
    case TypeKind.TYPE_REFERENCE:
      return extractNestedObjectTypes(
        maybeResolveRef({ type, name }, typeStore),
        typeStore
      );
    case TypeKind.OBJECT:
      return flatten([
        {
          name,
          type
        },
        ...type.properties.map(property =>
          extractNestedObjectTypes(
            {
              type: property.type,
              name: name + "." + property.name
            },
            typeStore
          )
        )
      ]);
    case TypeKind.ARRAY:
      return extractNestedObjectTypes({ type: type.elements, name }, typeStore);
    case TypeKind.UNION:
      return flatten(
        type.types.map((possibleType, index) =>
          extractNestedObjectTypes(
            {
              type: possibleType,
              name: `${name}[${index}]`
            },
            typeStore
          )
        )
      );
    default:
      throw assertNever(type);
  }
}
