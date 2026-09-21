export interface IError {
  success: boolean;
  statusCode: number;
  name: string;
  message: string;
  validationErrors: object;
  stack: object;
}
