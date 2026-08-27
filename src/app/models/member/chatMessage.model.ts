import { getFormattedDateAndTime } from "../../helpers/Functions/timeConverter";

export class ChatMessage {
  id: string | null;
  senderProfileId: string | null;
  receiverProfileId: string;
  textContent: string | null;
  fileUrls: string[];
  fileType: number;
  sentAt: string | null;
  isRead: boolean | null;
  readAt: string | null;
  isMine: boolean;

  constructor(obj: any) {
    this.id = obj?.id ?? '';
    this.senderProfileId = obj?.senderProfileId ?? '';
    this.receiverProfileId = obj?.receiverProfileId ?? '';
    this.textContent = obj?.textContent ?? null;
    this.fileUrls = obj?.fileUrls ?? [];
    this.fileType = obj?.fileType ?? 2;
    this.sentAt = getFormattedDateAndTime(obj?.sentAt) ?? '';
    this.isRead = obj?.isRead ?? false;
    this.readAt = obj?.readAt ?? null;
    this.isMine = obj?.isMine ?? false;
  }
}

export class ChatParticipant {
  receiverProfileId: string;
  name: string;
  profileImage: string | null;
  lastSentAt: string;
  isRead: boolean;
  lastMessage: string;
  fileType: number;
  isSentByMe:boolean;
  lastOnlineAt:string | null;
  isOnline:boolean;
  constructor(obj: any) {
    this.receiverProfileId = obj?.receiverProfileId ?? '';
    this.name = obj?.name ?? '';
    this.profileImage = obj?.profileImage ?? null;
    this.lastSentAt = getFormattedDateAndTime(obj?.lastSentAt) ?? '';
    this.isRead = obj?.isRead ?? false;
    this.lastMessage = obj?.lastMessage ?? '';
    this.fileType = obj?.fileType ?? 0;
    this.isSentByMe = obj?.isSentByMe ?? false;
    this.lastOnlineAt = obj?.lastOnlineAt !== null && obj?.lastOnlineAt !== "" ? getFormattedDateAndTime(obj?.lastOnlineAt) : null;
    this.isOnline = obj.isOnline ?? false;
  }
}
