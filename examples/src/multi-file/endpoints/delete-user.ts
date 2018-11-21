import {
  api,
  endpoint,
  genericError,
  header,
  pathParam,
  specificError,
  response
} from "@zenclabs/spot";

@api()
export class Api {
  @endpoint({
    method: "DELETE",
    path: "/users/:userId-confirmed"
  })
  @genericError<{
    message: string;
  }>()
  @specificError<{
    message: string;
    signedInAs: string;
  }>({
    name: "forbidden",
    statusCode: 403
  })
  deleteUser(
    @pathParam userId: string,
    @header({
      name: "Authorization"
    })
    authToken: string
  ): null {
    return response();
  }
}
