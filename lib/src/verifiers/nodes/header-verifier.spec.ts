import { HeaderNode } from "../../models/nodes";
import { TypeKind } from "../../models/types";
import { fakeLocatable } from "../../spec-helpers/fake-locatable";
import { verifyHeaderNode } from "./header-verifier";

describe("header node verifier", () => {
  test("valid for correct usage", () => {
    const headerNode: HeaderNode = {
      name: fakeLocatable("somename"),
      type: {
        kind: TypeKind.STRING
      },
      optional: true
    };
    expect(verifyHeaderNode(headerNode, [])).toHaveLength(0);
  });

  test("invalid for incorrect usage", () => {
    const headerNode: HeaderNode = {
      name: fakeLocatable("so$men ame"),
      type: {
        kind: TypeKind.NULL
      },
      optional: true
    };
    const errors = verifyHeaderNode(headerNode, []);
    expect(errors).toHaveLength(2);
    expect(errors).toContainEqual({
      message:
        "header name may only contain alphanumeric, underscore and hyphen characters",
      location: "somelocation.ts",
      line: 4
    });
    expect(errors).toContainEqual({
      message: "header type may only stem from string or number types",
      location: "somelocation.ts",
      line: 4
    });
  });
});
