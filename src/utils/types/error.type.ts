// export interface IError {
//   success: boolean;
//   statusCode: number;
//   name: string;
//   message: string;
//   validationErrors: object;
//   stack: object;
// }

export interface IError {
  response: {
    data: {
      success: boolean;
      statusCode: number;
      name: string;
      message: string;
      validationErrors: object;
      stack: object;
    };
  };
}
