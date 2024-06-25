import {nock} from "./nock.js";
import {PetstoreOpenapiSpec} from "./petstore-openapi-spec.js";
import {InvalidResponseError} from "./invalid-response-error.js";

it('should throw an error if the response is invalid', () => {
  const result = () => nock('https://api.petstore.com', PetstoreOpenapiSpec)
    .get('/pet/findByStatus')
    .reply(200, {
      "id": 1,
    });

  expect(result).toThrowError(InvalidResponseError);
  let error;
  try {
    result();
  } catch (e) {
    error = e;
  }
  const expectedErrors = [ { instancePath: '', schemaPath: '#/type', keyword: 'type', params: { type: 'array' }, message: 'must be array' } ];
  expect(error.errors).toEqual(expectedErrors);
})

it('should not throw an error if the response is valid', () => {
  const result = () => nock('https://api.petstore.com', PetstoreOpenapiSpec)
    .get('/pet/findByStatus')
    .reply(200, []);

  expect(result).not.toThrowError();
})