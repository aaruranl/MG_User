import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  constructor() {}

  public startNotificationHub(): void {
    let profileId = localStorage.getItem('currentMemberId');
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://dev-be-mgate.azurewebsites.net/hubs/notification?profileId=${profileId}`,
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
