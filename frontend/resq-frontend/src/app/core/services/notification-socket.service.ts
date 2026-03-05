import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationSocketService {

  private stompClient!: Client;

  private notificationSubject = new BehaviorSubject<any | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  connect() {

    if (this.stompClient?.active) return;

    console.log("Opening WebSocket...");

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      debug: (msg) => console.log(msg)
    });

    this.stompClient.onConnect = () => {

      console.log("Connected to WebSocket");

      this.stompClient.subscribe(
        "/topic/corridor-status",
        (message) => {

          const body = JSON.parse(message.body);
          console.log("WebSocket update:", body);

          this.notificationSubject.next(body);
        }
      );

    };

    this.stompClient.onStompError = (frame) => {
      console.error("Broker error:", frame);
    };

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      console.log("WebSocket disconnected");
    }
  }
}