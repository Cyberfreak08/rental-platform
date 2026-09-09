export class DomainError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' was not found.`, 'NOT_FOUND', 404, { entity, id });
  }
}

export class InvalidStateTransitionError extends DomainError {
  constructor(fromStatus: string, toStatus: string) {
    super(
      `Cannot transition booking from '${fromStatus}' to '${toStatus}'.`,
      'INVALID_STATE_TRANSITION',
      400,
      { fromStatus, toStatus }
    );
  }
}

export class ConcurrencyConflictError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONCURRENCY_CONFLICT', 409, details);
  }
}

export class VehicleUnavailableError extends DomainError {
  constructor(message: string = 'Requested vehicle is not available for the selected interval.', details?: Record<string, unknown>) {
    super(message, 'VEHICLE_UNAVAILABLE', 409, details);
  }
}

export class ModelUnavailableError extends DomainError {
  constructor(modelId: string, details?: Record<string, unknown>) {
    super(
      `No active physical vehicles are available for vehicle model '${modelId}' during the requested interval.`,
      'MODEL_UNAVAILABLE',
      409,
      { modelId, ...details }
    );
  }
}

export class BusinessClosureConflictError extends DomainError {
  constructor(reason?: string | null) {
    super(
      `The business is closed during the requested interval${reason ? `: ${reason}` : '.'}`,
      'BUSINESS_CLOSED',
      409,
      { reason }
    );
  }
}

export class VehicleBlockConflictError extends DomainError {
  constructor(vehicleId: string, reason?: string | null) {
    super(
      `Vehicle '${vehicleId}' is blocked during the requested interval${reason ? `: ${reason}` : '.'}`,
      'VEHICLE_BLOCKED',
      409,
      { vehicleId, reason }
    );
  }
}

export class ModelVehicleMismatchError extends DomainError {
  constructor(vehicleId: string, vehicleModelId: string, expectedModelId: string) {
    super(
      `Vehicle '${vehicleId}' belongs to model '${vehicleModelId}', but the booking requested model '${expectedModelId}'.`,
      'MODEL_VEHICLE_MISMATCH',
      400,
      { vehicleId, vehicleModelId, expectedModelId }
    );
  }
}

export class VehicleNotActiveError extends DomainError {
  constructor(vehicleId: string, operationalStatus: string) {
    super(
      `Vehicle '${vehicleId}' is not active (current status: '${operationalStatus}').`,
      'VEHICLE_NOT_ACTIVE',
      400,
      { vehicleId, operationalStatus }
    );
  }
}

export class InvalidIntervalError extends DomainError {
  constructor(message: string = 'Pickup date/time must be strictly before return date/time.') {
    super(message, 'INVALID_INTERVAL', 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Invalid or expired session.') {
    super(message, 'UNAUTHORIZED', 401);
  }
}
