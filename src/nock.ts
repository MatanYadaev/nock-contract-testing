import {OpenAPIV3} from "openapi-types";
import type {HttpMethod} from "./types/http-method.js";
import type {Entries, Simplify} from "type-fest";
import Ajv from "ajv";
import AjvFormats from "ajv-formats";
import nockReal from "nock";
import {InvalidResponseError} from "./invalid-response-error.js";

type PathWithMethod<TOpenAPISpec extends OpenAPIV3.Document, TMethod extends HttpMethod> = Simplify<{
  [TPath in keyof TOpenAPISpec["paths"]]:TOpenAPISpec["paths"][TPath] extends Record<TMethod, unknown> ? TPath : never
}[keyof TOpenAPISpec["paths"]]>;

type StringToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

const createAjv = <TOpenAPISpec extends OpenAPIV3.Document>(openApiSpec: TOpenAPISpec) => {
  const ajv = new Ajv({
    keywords: ['xml', 'example']
  })

  AjvFormats.default(ajv);

  return ajv;
}

const addComponentSchemas = <TOpenAPISpec extends OpenAPIV3.Document>(ajv: Ajv, openApiSpec: TOpenAPISpec) => {
  if (openApiSpec.components && openApiSpec.components.schemas) {
    for (const [key, schema] of Object.entries(openApiSpec.components.schemas) as Entries<typeof openApiSpec.components.schemas>) {
      ajv.addSchema(schema, `#/components/schemas/${key}`);
    }
  }
}

export const nock = <TOpenAPISpec extends OpenAPIV3.Document>(baseUrl: string, openApiSpec: TOpenAPISpec) => {
  const ajv = createAjv(openApiSpec);

  addComponentSchemas(ajv, openApiSpec);

  return {
    get: <TPath extends PathWithMethod<TOpenAPISpec, "get">, TResponses extends TOpenAPISpec["paths"][TPath]['get']['responses']>(path: TPath) => {
      return {
        reply: <TStatusCode extends StringToNumber<keyof TResponses>>(statusCode: TStatusCode, response: unknown) => {
          const validate = ajv.compile(openApiSpec.paths[path]['get'].responses[statusCode].content['application/json'].schema);

          if (!validate(response)) {
            throw new InvalidResponseError(validate.errors!);
          }

          return nockReal(baseUrl)
            .get(path)
            .reply(statusCode, response);
        }
      }
    }
  }
}