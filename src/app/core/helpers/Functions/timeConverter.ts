export function getFormattedDateAndTime(lastSentAt:any): string {
    if (!lastSentAt) return '';

    const sentDate = new Date(lastSentAt);
    const now = new Date();

    const isToday =
      sentDate.toDateString() === now.toDateString();

    const isThisYear =
      sentDate.getFullYear() === now.getFullYear();

    if (isToday) {
      return sentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }

    if (isThisYear) {
      return sentDate.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short'
      });
    }

    return sentDate.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  }

const CardBaseUrl = 'https://bublstorage.blob.core.windows.net/bubl/Documents/';
export function GetPaymentCardImage(cardType: string) {
  switch (cardType.toLowerCase()) {
    case 'visa' :
      return {
        name: 'Visa',
        image: CardBaseUrl + 'visa.svg'
      };
    case 'mastercard' :
      return {
        name: 'Master',
        image: CardBaseUrl + 'mastercard.svg'
      };
    case 'amex' :
      return {
        name: 'Amex',
        image: CardBaseUrl + 'amex.svg'
      };
    case 'unionpay' :
      return {
        name: 'Unionpay',
        image: CardBaseUrl + 'unionpay.svg'
      };
    case 'jcb' :
      return {
        name: 'JCB',
        image: CardBaseUrl + 'jcb.svg'
      };
    case 'discover' :
      return {
        name: 'Discover',
        image: CardBaseUrl + 'discover.svg'
      };
    case 'diners' :
      return {
        name: 'Diners',
        image: CardBaseUrl + 'diners.svg'
      };
    default:
      return {
        name: '',
        image: CardBaseUrl + 'unknown.svg'
      };
  };
};
