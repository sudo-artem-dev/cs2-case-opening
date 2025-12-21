import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // ⚠️ en prod, mets ton domaine
  },
  namespace: '/', // namespace par défaut
})
export class InventoryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  /**
   * 🔌 Quand un client se connecte
   */
  handleConnection(client: Socket) {
    console.log(`🟢 Socket connecté : ${client.id}`);
  }

  /**
   * ❌ Quand un client se déconnecte
   */
  handleDisconnect(client: Socket) {
    console.log(`🔴 Socket déconnecté : ${client.id}`);
  }

  /**
   * 👤 Le client s'identifie et rejoint sa room utilisateur
   * React Native → socket.emit('join', { userId })
   */
  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data?.userId) {
      console.warn('⚠️ join sans userId');
      return;
    }

    const room = `user-${data.userId}`;
    client.join(room);

    console.log(`👤 User ${data.userId} rejoint la room ${room}`);
  }

  /**
   * 📦 PUSH inventaire en temps réel
   * Appelé depuis CasesService
   */
  emitInventoryUpdate(userId: string, inventory: any) {
    const room = `user-${userId}`;

    console.log(`📤 Envoi inventory:update à ${room}`);

    this.server.to(room).emit('inventory:update', inventory);
  }
}
