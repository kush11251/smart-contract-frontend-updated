import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // baseUrl: string = "http://localhost:5000/"
  baseUrl: string = "https://smart-contract-api.onrender.com/"

  constructor(
    private http: HttpClient
  ) { }

  generateContract(data: any) {
    console.log(data)

    return this.http.post(this.baseUrl + 'checkApi', data)
  }

  getFileData(txId: String) {
    console.log(txId)

    return this.http.get(this.baseUrl + 'getLoanHTML/' + txId)
  }

  sendMail(data: any) {
    console.log(data)

    return this.http.post(this.baseUrl + 'sendEmail', data)
  }

  getDigiUrl() {
    return this.http.get(this.baseUrl + 'digilocker-session')
  }

  getDigiData(txKey: any) {
    return this.http.post(this.baseUrl + 'digilocker-data' + '/' + txKey, {})
  }

  updateAadharData(tnKey:any, txKey: any) {
    return this.http.post(this.baseUrl + 'add-aadhar' + '/' + tnKey + '/' + txKey, {})
  }

  getFullData(tnKey: any) {
    return this.http.get(this.baseUrl + 'get-data' + '/' + tnKey)
  }

  uploadFileToPinata() {}
}
