# In-Chat Payment Components

Complete suite of cryptocurrency payment components designed for chat interfaces. Built with React 19, TypeScript, Effect.ts, and shadcn/ui.

## Components Overview

### 1. ChatPayment
Send crypto payments directly in chat with inline payment UI.

**Features:**
- Token and amount selection
- Recipient detection from chat context
- Optional message attachment
- Quick payment confirmation
- Transaction receipt display
- Real-time payment notifications

**Usage:**
```tsx
import { ChatPayment } from '@/components/ontology-ui/crypto/chat';

<ChatPayment
  chatId="chat_123"
  recipientId="user_456"
  recipientName="Alice"
  recipientAddress="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  defaultToken="USDC"
  defaultAmount="10"
  onSend={(txHash) => console.log('Payment sent:', txHash)}
  onError={(error) => console.error('Payment failed:', error)}
/>
```

---

### 2. ChatRequest
Create payment requests with QR codes and expiration timers.

**Features:**
- QR code generation
- Expiration timer with countdown
- Payment status tracking
- Auto-complete when paid
- Shareable request links
- Multiple currency support

**Usage:**
```tsx
import { ChatRequest } from '@/components/ontology-ui/crypto/chat';

<ChatRequest
  chatId="chat_123"
  defaultToken="USDC"
  defaultAmount="50"
  onRequestCreated={(requestId) => console.log('Request created:', requestId)}
  onPaymentReceived={(txHash) => console.log('Payment received:', txHash)}
/>
```

---

### 3. ChatInvoice
Generate and send professional invoices in chat.

**Features:**
- Line item management
- Quantity and price calculation
- Automatic total calculation
- Payment deadline tracking
- Invoice numbering
- Payment confirmation
- Optional notes field

**Usage:**
```tsx
import { ChatInvoice } from '@/components/ontology-ui/crypto/chat';

<ChatInvoice
  chatId="chat_123"
  defaultToken="USDC"
  onInvoiceCreated={(invoiceId) => console.log('Invoice created:', invoiceId)}
  onPaymentReceived={(txHash) => console.log('Invoice paid:', txHash)}
/>
```

---

### 4. ChatTip
Tip users with quick amounts and leaderboard tracking.

**Features:**
- Quick tip amounts ($1, $5, $10, $20)
- Custom tip amount input
- Token selection
- Optional tip message
- Animated tip notifications
- Tip leaderboard display
- Accumulated tips tracking
- Rank badges (🥇🥈🥉)

**Usage:**
```tsx
import { ChatTip } from '@/components/ontology-ui/crypto/chat';

<ChatTip
  chatId="chat_123"
  recipientId="user_456"
  recipientName="Bob"
  recipientAddress="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  defaultToken="USDC"
  quickAmounts={["1", "5", "10", "20"]}
  showLeaderboard={true}
  onTipSent={(txHash) => console.log('Tip sent:', txHash)}
/>
```

---

### 5. ChatSplit
Split bills in group chats with equal or custom splits.

**Features:**
- Add participants from chat
- Equal or custom split modes
- Per-person amount display
- Payment tracking per participant
- Settlement status visualization
- Payment reminders
- Progress bar

**Usage:**
```tsx
import { ChatSplit } from '@/components/ontology-ui/crypto/chat';

const participants = [
  { id: "user1", name: "Alice", address: "0x..." },
  { id: "user2", name: "Bob", address: "0x..." },
  { id: "user3", name: "Charlie", address: "0x..." },
];

<ChatSplit
  chatId="chat_123"
  participants={participants}
  defaultToken="USDC"
  onSplitCreated={(splitId) => console.log('Split created:', splitId)}
  onPaymentMade={(participantId, txHash) => console.log('Payment made:', participantId, txHash)}
/>
```

---

### 6. ChatEscrow
Create secure escrow agreements with milestone-based releases.

**Features:**
- Escrow agreement creation
- Terms and conditions
- Payment deadline
- Milestone-based releases
- Release funds control
- Dispute resolution tracking
- Status monitoring

**Usage:**
```tsx
import { ChatEscrow } from '@/components/ontology-ui/crypto/chat';

<ChatEscrow
  chatId="chat_123"
  recipientId="user_789"
  recipientName="Dave"
  recipientAddress="0x1234567890123456789012345678901234567890"
  defaultToken="USDC"
  onEscrowCreated={(escrowId) => console.log('Escrow created:', escrowId)}
  onFundsReleased={(amount) => console.log('Funds released:', amount)}
/>
```

---

### 7. ChatReceipt
Display beautiful payment receipts with all transaction details.

**Features:**
- Transaction summary
- From/to addresses with ENS names
- Amount and USD value
- Transaction hash with copy button
- Explorer link (Etherscan)
- Timestamp and confirmations
- Gas usage and cost
- PDF download option

**Usage:**
```tsx
import { ChatReceipt } from '@/components/ontology-ui/crypto/chat';

<ChatReceipt
  txHash="0xabc123..."
  type="payment"
  from="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  fromEns="alice.eth"
  to="0x1234567890123456789012345678901234567890"
  toEns="bob.eth"
  amount="10.00"
  token="USDC"
  usdValue="10.00"
  timestamp={Date.now()}
  confirmations={12}
  gasUsed="65000"
  gasCost="0.0025"
  description="Payment via chat"
  showDownload={true}
  onDownload={() => console.log('Download receipt')}
/>
```

---

## Integration Guide

### 1. Basic Chat Integration

```tsx
import { useState } from 'react';
import {
  ChatPayment,
  ChatRequest,
  ChatInvoice,
  ChatTip,
  ChatReceipt
} from '@/components/ontology-ui/crypto/chat';

export function ChatInterface() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const chatId = "chat_123";
  const currentUser = { id: "user_1", name: "Alice", address: "0x..." };

  return (
    <div className="chat-container">
      {/* Chat messages */}
      <div className="messages">
        {/* Your chat messages here */}
      </div>

      {/* Payment actions toolbar */}
      <div className="payment-actions">
        <button onClick={() => setActiveComponent('payment')}>💸 Send</button>
        <button onClick={() => setActiveComponent('request')}>📬 Request</button>
        <button onClick={() => setActiveComponent('invoice')}>📄 Invoice</button>
        <button onClick={() => setActiveComponent('tip')}>💰 Tip</button>
        <button onClick={() => setActiveComponent('split')}>💰 Split</button>
        <button onClick={() => setActiveComponent('escrow')}>🔒 Escrow</button>
      </div>

      {/* Payment component modal */}
      {activeComponent === 'payment' && (
        <ChatPayment
          chatId={chatId}
          recipientId="user_2"
          recipientName="Bob"
          recipientAddress="0x..."
          onSend={(txHash) => {
            console.log('Payment sent:', txHash);
            setActiveComponent(null);
          }}
        />
      )}

      {/* Add other components similarly */}
    </div>
  );
}
```

### 2. Chat Message Types

Define message types for different payment interactions:

```typescript
type ChatMessage = {
  id: string;
  senderId: string;
  timestamp: number;
  type: 'text' | 'payment' | 'request' | 'invoice' | 'tip' | 'split' | 'escrow';
  content: string;
  paymentData?: {
    txHash?: string;
    amount?: string;
    token?: string;
    status?: 'pending' | 'confirmed' | 'failed';
  };
};
```

### 3. Render Payment Messages

```tsx
function renderPaymentMessage(message: ChatMessage) {
  switch (message.type) {
    case 'payment':
      return (
        <div className="payment-message">
          💸 Sent {message.paymentData?.amount} {message.paymentData?.token}
          <ChatReceipt {...message.paymentData} />
        </div>
      );

    case 'request':
      return (
        <div className="request-message">
          📬 Requested payment
          <ChatRequest chatId={message.chatId} {...message.paymentData} />
        </div>
      );

    // Add other types...
  }
}
```

### 4. Real-time Payment Notifications

```tsx
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

function useChatPaymentNotifications(chatId: string) {
  useEffect(() => {
    // Subscribe to payment events
    const unsubscribe = subscribeToPayments(chatId, (event) => {
      switch (event.type) {
        case 'payment_received':
          toast({
            title: "💸 Payment Received",
            description: `${event.amount} ${event.token} from ${event.from}`,
          });
          break;

        case 'tip_received':
          toast({
            title: "💰 Tip Received!",
            description: `${event.from} tipped you ${event.amount} ${event.token}`,
          });
          break;

        // Handle other events...
      }
    });

    return () => unsubscribe();
  }, [chatId]);
}
```

---

## Service Integration

All components use `ChatPaymentService` with Effect.ts for type-safe payment operations:

```typescript
import * as ChatPaymentService from '@/lib/services/crypto/ChatPaymentService';
import { Effect } from 'effect';

// Send payment
const result = await Effect.runPromise(
  ChatPaymentService.sendChatPayment({
    recipientId: "user_456",
    recipientAddress: "0x...",
    amount: "10",
    token: "USDC",
    message: "Thanks for lunch!",
    chatId: "chat_123",
  })
);

// Create payment request
const request = await Effect.runPromise(
  ChatPaymentService.createPaymentRequest({
    amount: "50",
    token: "USDC",
    description: "Monthly subscription",
    expiresIn: 3600000, // 1 hour
    chatId: "chat_123",
  })
);

// Send tip
const tip = await Effect.runPromise(
  ChatPaymentService.sendTip({
    recipientId: "user_789",
    recipientAddress: "0x...",
    amount: "5",
    token: "USDC",
    message: "Great work!",
    chatId: "chat_123",
  })
);
```

---

## Styling & Theming

All components use shadcn/ui and support dark mode out of the box:

```tsx
// Light mode
<div className="light">
  <ChatPayment {...props} />
</div>

// Dark mode
<div className="dark">
  <ChatPayment {...props} />
</div>
```

Components support size variants:
```tsx
<ChatPayment size="sm" />  {/* Small */}
<ChatPayment size="md" />  {/* Medium (default) */}
<ChatPayment size="lg" />  {/* Large */}
```

---

## Error Handling

All components handle errors gracefully with user-friendly messages:

```tsx
<ChatPayment
  onError={(error) => {
    switch (error) {
      case 'Insufficient balance':
        // Show balance error
        break;
      case 'Invalid amount':
        // Show validation error
        break;
      default:
        // Show generic error
    }
  }}
/>
```

---

## Testing

Mock data is provided for development:

```typescript
const MOCK_TOKENS = [
  { symbol: "USDC", name: "USD Coin", balance: "1000.50", icon: "💵" },
  { symbol: "USDT", name: "Tether USD", balance: "500.25", icon: "💲" },
  { symbol: "ETH", name: "Ethereum", balance: "2.5", icon: "💎" },
];

const MOCK_USERS = [
  { id: "user1", name: "Alice", address: "0x..." },
  { id: "user2", name: "Bob", address: "0x..." },
];
```

---

## Best Practices

1. **Always validate amounts** before sending payments
2. **Show loading states** during transactions
3. **Display clear error messages** to users
4. **Track payment status** in real-time
5. **Store receipts** for record-keeping
6. **Use ENS names** when available for better UX
7. **Enable dark mode** for all components
8. **Test with different token types**
9. **Handle network errors** gracefully
10. **Implement confirmation dialogs** for large amounts

---

## Related Components

- Wallet components: `/crypto/wallet/`
- Portfolio components: `/crypto/portfolio/`
- Transaction components: `/crypto/transactions/`
- Payment components: `/crypto/payments/`

---

## Support

For issues or questions:
- GitHub: https://github.com/your-org/one
- Documentation: https://one.ie/docs/crypto-chat-payments
- Discord: https://discord.gg/one

---

**Built with clarity, security, and user experience in mind. 🚀**
