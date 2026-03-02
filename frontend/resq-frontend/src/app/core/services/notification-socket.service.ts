import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationSocketService {

  private stompClient!: Client;

  private notificationSubject = new BehaviorSubject<any>(null);
  public notification$ = this.notificationSubject.asObservable();

  connect(building: string) {

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',   // ✅ WebSocket puro
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      }
    });

    this.stompClient.onConnect = () => {

      console.log('Connected to WebSocket');

      this.stompClient.subscribe(
        `/topic/building/${building}`,
        (message) => {
          const body = JSON.parse(message.body);
          this.notificationSubject.next(body);
        }
      );
    };

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}