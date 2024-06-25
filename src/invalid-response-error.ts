import type {ErrorObject} from "ajv";

export class InvalidResponseError extends Error {
  constructor(public readonly errors: ErrorObject[]) {
    super('The mocked response does is not valid according to the OpenAPI spec');
    this.name = 'InvalidResponseError';
  }
}