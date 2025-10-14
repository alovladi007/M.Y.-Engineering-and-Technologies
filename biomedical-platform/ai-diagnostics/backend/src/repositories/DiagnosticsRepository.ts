import { query } from '../../../../shared/config/database';
import { DiagnosticRequest } from '../../../../shared/types';

export default class DiagnosticsRepository {
  async createDiagnosticRequest(diagnostic: Partial<DiagnosticRequest>): Promise<void> {
    await query(
      `INSERT INTO diagnostic_requests
       (id, patient_id, request_type, input_data, urgency, requested_by, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        diagnostic.id,
        diagnostic.patientId,
        diagnostic.requestType,
        JSON.stringify(diagnostic.inputData),
        diagnostic.urgency,
        diagnostic.requestedBy,
        diagnostic.status,
        diagnostic.createdAt,
        diagnostic.updatedAt
      ]
    );
  }

  async updateDiagnosticResult(id: string, result: any): Promise<void> {
    await query(
      `UPDATE diagnostic_requests
       SET result = $1, status = $2, updated_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(result), 'completed', id]
    );
  }

  async updateDiagnosticStatus(id: string, status: string): Promise<void> {
    await query(
      `UPDATE diagnostic_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2`,
      [status, id]
    );
  }

  async getDiagnosticById(id: string): Promise<any> {
    const result = await query(
      `SELECT * FROM diagnostic_requests WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getDiagnosticsByPatient(patientId: string, page = 1, limit = 10): Promise<any> {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT * FROM diagnostic_requests
       WHERE patient_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM diagnostic_requests WHERE patient_id = $1`,
      [patientId]
    );

    return {
      items: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    };
  }

  async getPatientHistory(patientId: string): Promise<any[]> {
    const result = await query(
      `SELECT * FROM diagnostic_requests
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );
    return result.rows;
  }
}
