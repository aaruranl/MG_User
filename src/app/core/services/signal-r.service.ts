import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private hubUrl = (environment as any).hubUrl;
  constructor() {}

  public startNotificationHub(): void {
    let profileId = localStorage.getItem('currentMemberId');
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `${this.hubUrl}notification?profileId=${profileId}`,
        {
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling,
          accessTokenFactory: () => {
            return localStorage.getItem('token')!;
          },
          withCredentials: false,
        }
      )
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log(''))
      .catch((err) => console.log(''));
  }

  public receiveNotification(callback: (data: any) => void): void {
    this.hubConnection.on('NotificationReceived', (data) => {
      callback(data);
    });
  }
}
