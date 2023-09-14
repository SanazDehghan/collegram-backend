export class ServiceError extends Error {}

export class UsernameTakenError extends ServiceError {}

export class DuplicateEmailError extends ServiceError {}

export class InvalidTokenError extends ServiceError {}

export class InvalidUsernameOrPasswordError extends ServiceError {}

export class InvalidEmailError extends ServiceError {}

export class UserNotFound extends ServiceError {}

export class PostNotFound extends ServiceError {}

export class ForbiddenNumberOfPhotos extends ServiceError {}

export class ForbiddenNumberOfTags extends ServiceError {}

export class CommentNotFound extends ServiceError {}

export class InvalidCommentError extends ServiceError {}
