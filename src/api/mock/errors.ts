import type { ApiError } from '@/types/report';

export const MOCK_FAILURES = true;

export class MockApiError extends Error {
  apiError: ApiError;
  constructor(apiError: ApiError) {
    super(apiError.message);
    this.apiError = apiError;
  }
}

const RANDOM_ERRORS: ApiError[] = [
  {
    code: 'QUERY_TIMEOUT',
    message: 'The query took too long to complete against the data source.',
    hint: 'Try narrowing your date range or adding a more selective filter.',
  },
  {
    code: 'DATA_SOURCE_UNAVAILABLE',
    message: 'The underlying data source is temporarily unavailable.',
    hint: 'Wait a moment and retry the query.',
  },
  {
    code: 'RESULT_TOO_LARGE',
    message: 'The query result exceeded the maximum allowed size.',
    hint: 'Reduce the row limit or add filters to shrink the result set.',
  },
];

export function maybeThrow(): void {
  if (!MOCK_FAILURES) return;
  if (Math.random() < 1 / 40) {
    const err = RANDOM_ERRORS[Math.floor(Math.random() * RANDOM_ERRORS.length)] as ApiError;
    throw new MockApiError(err);
  }
}

export function delay(): Promise<void> {
  const ms = 150 + Math.random() * 250;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
