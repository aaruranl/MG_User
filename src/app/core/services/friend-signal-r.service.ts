import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FriendSignalRService {
  private hubConnection!: signalR.HubConnection;

  private friendRequestAcceptedSource = new Subject<string>();
  friendRequestAccepted$ = this.friendRequestAcceptedSource.asObservable();

  constructor(private http: HttpClient) { }

  public startConnection(): void {
    let profileId = localStorage.getItem('currentMemberId');
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://dev-be-mgate.azurewebsites.net/hubs/friend-request?profileId=${profileId}`,
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
      .then(() => { })
      .catch((err) => console.log(err));
  }

  public registerFriendRequestListener(callback: (data: any) => void): void {
    this.hubConnection.on('FriendRequestReceived', (data) => {
      callback(data);
    });
  }

  public notifyFriendRequestAccepted(requestId: string): void {
    this.friendRequestAcceptedSource.next(requestId);
  }


}
