import {nock} from "./nock.js";
import {PetstoreOpenapiSpec} from "./petstore-openapi-spec.js";

nock('https://api.petstore.com', PetstoreOpenapiSpec)
  .get('/pet/findByStatus')
  .reply(200, {
    "id": 1,
  })