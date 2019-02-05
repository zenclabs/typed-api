import {
  body,
  endpoint,
  headers,
  interaction,
  pathParams,
  queryParams,
  request,
  response
} from "@airtasker/spot";
import { ErrorBody, UserBody } from "./models";

/** Retrieves a user in a company */
@endpoint({
  method: "POST",
  path: "/company/:companyId/users/:userId",
  tags: ["Company", "User"]
})
class GetUser {
  @request
  request(
    @pathParams
    pathParams: {
      /** company identifier */
      companyId: string;
      /** user identifier */
      userId: string;
    },
    @headers
    headers: {
      /** Auth Header */
      "x-auth-token": string;
    },
    @queryParams
    queryParams: {
      /** a demo query param */
      "sample-query"?: string;
    }
  ) {}

  /** Successful creation of user */
  @response({ status: 201 })
  successResponse(
    @headers
    headers: {
      /** Location header */
      Location: string;
    },
    /** User response body */
    @body body: UserBody
  ) {}

  /** Bad request response */
  @response({ status: 404 })
  badRequestResponse(
    /** Error response body */
    @body body: ErrorBody
  ) {}

  @interaction({
    states: [userExistsState(101)],
    request: {},
    response: { status: 201 }
  })
  successResponseInteraction() {}
}

function userExistsState(id: number) {
  return {
    name: "user exists",
    params: {
      id: id
    }
  };
}
