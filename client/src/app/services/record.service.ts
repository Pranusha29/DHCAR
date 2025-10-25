import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Record, CreateRecordRequest, UpdateRecordRequest } from '../models/record.model';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  getRecords(params?: {
    patientId?: string;
    doctorId?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/records`, { params: httpParams });
  }

  getRecord(id: string): Observable<Record> {
    return this.http.get<Record>(`${this.apiUrl}/records/${id}`);
  }

  createRecord(record: CreateRecordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/records`, record);
  }

  updateRecord(id: string, record: UpdateRecordRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/records/${id}`, record);
  }

  deleteRecord(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/records/${id}`);
  }
}
