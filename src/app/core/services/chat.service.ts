import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, ChatParticipant } from '../../models/index.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  private baseUrl = (environment as any).baseUrl;
  private participant: ChatParticipant | null = null;

  constructor(private http: HttpClient) { }

   public startConnection(): void {
    let profileId = localStorage.getItem('currentMemberId');
    this.hubConnection = new signalR.HubConnectionBuilder()
       .withUrl(`https://dev-be-mgate.azurewebsites.net/hubs/chat?profileId=${profileId}`, {
       transport: signalR.HttpTransportType.WebSockets |
             signalR.HttpTransportType.ServerSentEvents |
             signalR.HttpTransportType.LongPolling,
        accessTokenFactory: () => {
          return localStorage.getItem('token')!;
        },
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => {
        this.getChatParticipants()
      }).catch(err => console.log('Error while starting connection: ' + err));

    //  this.registerReceiveHandlers();
  }

   public sendMessage(user: string, textContent: string, fileUrls:string[], fileType:any ): void {
    this.hubConnection.invoke('SendMessage', user, textContent, fileUrls,fileType)
      .catch(err => console.error(err));
  }

  public onMessageReceived(callback: (message: ChatMessage) => void): void {
    this.hubConnection.on('ReceiveMessage', (data: any) => {
      const message = new ChatMessage(data);
      callback(message);
    });
  }

 //CHAT PARTICIPANTS
  public getChatParticipants(): void {
    this.hubConnection.invoke('GetChatParticipants')
      .catch(err => console.error('GetChatParticipants failed', err));
  }

  public onChatParticipantsReceived(callback: (participants: any[]) => void): void {
    this.hubConnection.on('ChatParticipants', (data:any) => {
      const participants = data.map((p:any) => new ChatParticipant(p));
      callback(participants);
    });
  }

  //TYPING
  public sendTypingStarted(toProfileId: string): void {
  this.hubConnection.invoke('TypingStarted', toProfileId)
    .catch(err => console.error('TypingStarted error:', err));
  }

  public sendTypingStopped(toProfileId: string): void {
    this.hubConnection.invoke('TypingStopped', toProfileId)
      .catch(err => console.error('TypingStopped error:', err));
  }

  public onTypingStarted(callback: (fromProfileId: string) => void): void {
    this.hubConnection.on('TypingStarted', callback);
  }

  public onTypingStopped(callback: (fromProfileId: string) => void): void {
    this.hubConnection.on('TypingStopped', callback);
  }


  public markMessageAsRead(messageId: string): void {
    this.hubConnection
      .invoke('MessageRead', messageId)
      .catch(err => console.error('Error calling MessageRead:', err));
  }

  public onMessageRead(callback: (messageId: string, senderId: string, readAt: string) => void): void {
    this.hubConnection.on('MessageRead', callback);
  }

  //HTTP CALLS
  public getPrivateMessages(withProfileId:string, pageNumber:number, pageSize:number){
    let profileId = localStorage.getItem('currentMemberId');
    return this.http.get(this.baseUrl + `Chat/history?profileId=${profileId}&withProfileId=${withProfileId}&pageNumber=${pageNumber}&pageSize=${pageSize}`).pipe(
        map((res: any) => {
        return res.Result.data.map((data:any) => new ChatMessage(data));
      })
    );
  }

  public makeAllMessageAreRead(senderId:string){
    let profileId = localStorage.getItem('currentMemberId');
    return this.http.get(this.baseUrl + `Chat/read-chat?receiverId=${profileId}&senderId=${senderId}`).pipe(
        map((res: any) => {
        return res;
      })
    );
  }


  //CHAT PARTICIPANTS CAME FROM FILTER LIST
  public setParticipant(participant: ChatParticipant) {
    this.participant = participant;
  }

  public getParticipant(): ChatParticipant | null {
    return this.participant;
  }

  public clearParticipant() {
    this.participant = null;
  }

}
