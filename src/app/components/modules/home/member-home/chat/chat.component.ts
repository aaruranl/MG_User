import { ChatService } from './../../../../../core/services/chat.service';
import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FORM_MODULES } from '../../../../../common/common-imports';
import { MemberService } from '../../../../../core/services/member.service';
import {
  ChatMessage,
  ChatParticipant,
} from '../../../../../models/index.model';
import { FileType } from '../../../../../helpers/enum';
import { LoadingComponent } from '../../../../../common/loading/loading.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [FORM_MODULES, CommonModule, LoadingComponent, PickerComponent, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  @ViewChildren('minSpend') minSpend!: QueryList<ElementRef>;
  public previewImage: string[] = [];
  public searchTerm: string = '';
  public selectedReceiverId: string | null = null;
  public selectedParticipant!: ChatParticipant;
  public isUploading: boolean = false;
  public isLoading: boolean = false;
  public isOpenChat:boolean = false;

  public isCanShowList:boolean = false;
  public isCanShowChatHistory:boolean = false;

  public isGetParticipant: boolean = false;
  public searchControl = new FormControl('');
  public file_type = FileType;

  public participants: ChatParticipant[] = [];
  public isLoadingPar: boolean = true;

  public newMessage: string = '';
  public selectedFile: any | null = null;
  public messagesCheck: ChatMessage[] = [];

  public isTyping = false;
  public typingTimeout: any;
  public typingMembers = new Set<string>();
  public screenWidth: number = window.innerWidth;
  showEmojiPicker = false;
  sets = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger',
  ];
  set = 'twitter';

  constructor(
    private _chatService: ChatService,
    private _memberService: MemberService
  ) {
    this._chatService.startConnection();
    const participant = this._chatService.getParticipant();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.updateScreenWidth();
  }
  private updateScreenWidth(): void {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth > 546) {
      this.isOpenChat = true;
    }else{}
  }

  ngOnInit() {
    this._chatService.onMessageReceived((message: any) => {
      const isFromSelected =
        message.senderProfileId ===
          this.selectedParticipant.receiverProfileId ||
        message.receiverProfileId ===
          this.selectedParticipant.receiverProfileId;
      if (isFromSelected) {
        this.messagesCheck.push(message);
        this.scrollToBottom();
      } else {
        const index = this.participants.findIndex(
          (p) => p.receiverProfileId === message.senderProfileId
        );
        if (index !== -1) {
          this.participants[index].isRead = false;
        }
      }
      this.markAsRead(message.id)
    });

    this._chatService.onChatParticipantsReceived((data: any[]) => {

      this.participants = data;
      const participant = this._chatService.getParticipant();

      if (participant !== null) {
        let member = this.participants.find(
          (p: ChatParticipant) =>
            p.receiverProfileId === participant.receiverProfileId
        );

        if (!member) {
          this.participants.unshift(participant);
          this.selectedParticipant = participant;
        }else{
          const index = this.participants.indexOf(member);
          if (index > -1) {
            this.participants.splice(index, 1);
            this.participants.unshift(member);
            this.selectedParticipant = member;
          }
        }
      }
      if (!this.isGetParticipant && data.length > 0) {
        this.getPrivateMessage(data[0]);
      } else {
        this.isLoadingPar = false;
      }
      this.isGetParticipant = true;

       this.updateScreenWidth();


    });

    //typing
    this._chatService.onTypingStarted((fromProfileId: string) => {
      this.typingMembers.add(fromProfileId);
      this.scrollToBottom();
    });

    this._chatService.onTypingStopped((fromProfileId: string) => {
      this.typingMembers.delete(fromProfileId);
    });

    this._chatService.onMessageRead((messageId, senderId, readAt) => {
    //  const message = this.messagesCheck.find((m: any) => m.id === messageId);
    //   if (message) {
    //     message.isRead = true;
    //     message.readAt = readAt;
    //   }else{
    //     message!.isRead = true;
    //   }

    // const lastMessage:any = this.messagesCheck?.length
    //     ? this.messagesCheck[this.messagesCheck.length - 1]
    //     : null;
    //     if (lastMessage) {
    //     //  this.markAsRead(lastMessage.id);
    //     }

    //     this.messagesCheck.forEach((m:any) => {

    //     })
  });
  }



  focusInput() {
    this.minSpend.first.nativeElement.focus();
  }

  public sendMessage() {
    let fileType: number;
    let textContent: any = null;
    let fileUrls: string[] = this.previewImage;
    if (this.selectedFile) {
      fileType = FileType.Image;
      this.previewImage = [];
      this.selectedFile = '';
    } else if (this.newMessage.trim()) {
      textContent = this.newMessage.trim();
      fileType = FileType.Text;
      this.newMessage = '';
    } else {
      return;
    }

    this._chatService.sendMessage(
      this.selectedParticipant.receiverProfileId,
      textContent,
      fileUrls,
      fileType
    );

    const sentMessage = new ChatMessage({
      id: null,
      senderProfileId: 'You',
      receiverProfileId: this.selectedParticipant.receiverProfileId,
      textContent: textContent,
      fileUrls: fileUrls,
      fileType: fileType,
      sentAt: new Date().toISOString(),
      isRead: false,
      readAt: null,
      isMine: true,
    });

    this.messagesCheck.push(sentMessage);
    this.showEmojiPicker = false;
    this.scrollToBottom();
    this._chatService.clearParticipant();
    this.focusInput();
  }

  public onFileSelected(event: Event): void {
    this.isUploading = false;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this._memberService.uploadImageToBulb(formData).subscribe({
      next: (res) => {
        this.selectedFile = res.Result;
        this.previewImage.push(res.Result);
      },
      complete: () => {
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.isUploading = false;
      },
    });
    input.value = '';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if(this.chatMessagesContainer){
        this.chatMessagesContainer.nativeElement.scrollTop =
        this.chatMessagesContainer.nativeElement.scrollHeight;
      }

    }, 100);
  }

  public clearImagePreview() {
    this.previewImage = [];
    this.selectedFile = null;
  }

  //TYPING
  public onTyping(): void {
    if (!this.selectedParticipant) return;
    if (!this.isTyping) {
      this._chatService.sendTypingStarted(
        this.selectedParticipant.receiverProfileId
      );
      this.isTyping = true;
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 2000);
  }

  public stopTyping(): void {
    if (this.isTyping && this.selectedParticipant) {
      this._chatService.sendTypingStopped(
        this.selectedParticipant.receiverProfileId
      );
      this.isTyping = false;
    }
  }

  //MESSAGE READ
  markAsRead(messageId: string) {
 // this._chatService.markMessageAsRead(messageId);
}

  public getPrivateMessage(receiver: ChatParticipant) {
    this.isOpenChat = true;
    this.selectedParticipant = receiver;
    this.isLoading = true;
    this._chatService
      .getPrivateMessages(receiver.receiverProfileId, 1, 25)
      .subscribe({
        next: (res: any) => {
          this.messagesCheck = res;
          this.isLoadingPar = false;
          this.readAllMessages(receiver.receiverProfileId);
        },
        complete: () => {
          this.isLoading = false;
          this.scrollToBottom();
          const lastMessage:any = this.messagesCheck?.length
        ? this.messagesCheck[this.messagesCheck.length - 1]
        : null;
        if (lastMessage) {
          this.markAsRead(lastMessage.id);
        }
        //  this.focusInput();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.isLoadingPar = false;
        },
      });
  }

  //READ ALL MESSAGES
  public readAllMessages(senderId:string){
    this._chatService.makeAllMessageAreRead(senderId).subscribe({
      next:(res:any) =>{
      }
    })
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.newMessage += event.emoji.native;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }
  onBlur() {

  }

  filteredParticipants(): any[] {
    if (!this.searchTerm) return this.participants;

    return this.participants.filter(member =>
      member.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

}
