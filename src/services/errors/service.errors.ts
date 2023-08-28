export class ServiceError extends Error {}

export class InvalidTokenError extends ServiceError {}

export class UsernameTakenError extends Error {}

export class DuplicateEmailError extends Error {}
