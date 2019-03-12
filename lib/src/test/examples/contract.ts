import {
  api,
  body,
  defaultResponse,
  endpoint,
  headers,
  pathParams,
  queryParams,
  request,
  response,
  securityHeader,
  test
} from "@airtasker/spot";
import "./contract-endpoint";
import { Address, ErrorBody, UserBody } from "./models";

/** This is the company API. It does cool things */
@api({ name: "company-api" })
class ExampleApi {
  @securityHeader
  public "x-auth-token": string;
}

/** Creates a user in a company */
@endpoint({
  method: "POST",
  path: "/company/:companyId/users",
  tags: ["Company", "User"]
})
class CreateUser {
  @request
  public request(
    @pathParams
    pathParams: {
      /** company identifier */
      companyId: string;
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
    },
    /** request body */
    @body body: CreateUserRequestBody
  ) {}

  /** Successful creation of user */
  @response({ status: 201 })
  public successResponse(
    @headers
    headers: {
      /** Location header */
      Location: string;
    },
    /** User response body */
    @body body: UserBody
  ) {}

  /** Bad request response */
  @response({ status: 400 })
  public badRequestResponse(
    /** Error response body */
    @body body: ErrorBody
  ) {}

  @defaultResponse
  public unexpectedResponse(
    /** Error response body */
    @body body: ErrorBody
  ) {}

  @test({
    request: {
      pathParams: {
        companyId: "abc"
      },
      headers: {
        "x-auth-token": "hellotoken"
      },
      body: {
        data: {
          firstName: "John",
          lastName: "Snow",
          age: 15,
          email: "johnsnow@spot.com",
          address: "some address"
        }
      }
    },
    response: {
      status: 201
    }
  })
  successResponseTest() {}
}

/** User request body */
interface CreateUserRequestBody {
  /** data wrapper */
  data: {
    /** user first name */
    firstName: string;
    /** user last name */
    lastName: string;
    /** user age */
    age: number;
    /** user email */
    email: Email;
    /** user address */
    address: Address;
  };
}

/** an email */
type Email = string;
