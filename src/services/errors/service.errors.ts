export class ServiceError extends Error{}

export class UsernameTakenError extends ServiceError {}

export class DuplicateEmailError extends ServiceError {}

export class InvalidTokenError extends ServiceError {}
