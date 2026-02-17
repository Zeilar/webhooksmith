import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server } from "socket.io";

@WebSocketGateway({ cors: { origin: process.env.NEXT_PUBLIC_APP_URL ?? "*" } })
export class WsGateway {
  @WebSocketServer()
  private server: Server;

  public broadcast(event: string, payload: unknown): void {
    Logger.verbose(`Broadcasting to: ${event}`);
    this.server.emit(event, payload);
  }
}
