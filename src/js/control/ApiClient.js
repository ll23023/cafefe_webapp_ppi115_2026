/**
 *
 * @author Mil
 */

import { API_BASE_URL } from '../config.js';

export { API_BASE_URL };

export const ResponseHeaders = Object.freeze({
  PROCESS_ERROR: 'Process-Error',
  APP_ERROR: 'App-Error',
  WRONG_PARAMETER: 'Wrong-Parameter',
  WRONG_PARAM: 'Wrong-Param',
  NOT_FOUND: 'Not-Found',
  TOTAL_RECORDS: 'Total-Records',
  TOTAL_REGISTROS: 'Total-Records',
  VIOLATES_BUSINESS_RULES: 'Violates-Business-Rules',
});

export class ApiClient {
  static async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(await this.#extraerError(response));
    }

    return response;
  }

  static async #extraerError(response) {
    const rawBody = await response.text();
    if (rawBody) {
      try {
        const parsed = JSON.parse(rawBody);
        if (parsed?.error) return parsed.error;
      } catch {
        // Si no trae JSON válido, se revisan las cabeceras
      }
    }

    const headerMsg =
      response.headers.get(ResponseHeaders.VIOLATES_BUSINESS_RULES) ||
      response.headers.get(ResponseHeaders.WRONG_PARAMETER) ||
      response.headers.get(ResponseHeaders.WRONG_PARAM) ||
      response.headers.get(ResponseHeaders.NOT_FOUND) ||
      response.headers.get(ResponseHeaders.PROCESS_ERROR) ||
      response.headers.get(ResponseHeaders.APP_ERROR);

    if (headerMsg) {
      return response.status === 404
        ? `Recurso no encontrado (${headerMsg})`
        : headerMsg;
    }

    return `Error HTTP ${response.status}`;
  }

  static extraerIdDeLocation(response) {
    const location = response.headers.get('Location');
    return location ? location.split('/').pop() : null;
  }
}