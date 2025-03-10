<script setup lang="ts">
import { ref } from 'vue';
import { Client } from '@stomp/stompjs';

const socket = ref<Client | null>(null);
const userId = ref<string>('1'); // Замените на нужный userId
const message = ref<string>('');
const reciverUserId = ref<string>('');

// 1. Подключение к сокету
const connectToSocket = () => {
  socket.value = new Client({
    brokerURL: 'ws://localhost:9023/ws', // Укажите ваш URL WebSocket
    onConnect: () => {
      console.log('Connected to WebSocket');
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    },
  });

  socket.value.activate();
};

// 2. Подписка по userId
const subscribeToUser = () => {
  if (socket.value) {
    socket.value.subscribe(`/user/${userId.value}/result`, (message) => {
      console.log('Received message:', message.body);
    });
  }
};

// 3. Отправка сообщения
const sendMessage = () => {
  if (socket.value) {
    const resultDto = {
      userId: reciverUserId.value,
      result: message.value,
    };
    socket.value.publish({
      destination: '/app/result',
      body: JSON.stringify(resultDto),
    });
  }
};

// 4. Отключение от сокета
const disconnectFromSocket = () => {
  if (socket.value) {
    socket.value.deactivate();
    console.log('Disconnected from WebSocket');
  }
};
</script>

<template>
  <header>
    <div class="controls">
      <!-- Подключение к сокету -->
      <div class="control-group">
        <div class="button-container">
          <button class="connect-button" @click="connectToSocket">1. Подключиться к сокету</button>
        </div>
      </div>

      <!-- Подписка по userId -->
      <div class="control-group">
        <label for="userId">Ваш userId:</label>
        <input id="userId" v-model="userId" placeholder="Введите userId" />
      </div>
      <div class="control-group">
        <div class="button-container">
          <button @click="subscribeToUser">2. Подписаться по userId</button>
        </div>
      </div>

      <!-- Отправка сообщения -->
      <div class="control-group">
        <label for="receiverUserId">ID получателя:</label>
        <input id="receiverUserId" v-model="reciverUserId" placeholder="Введите receiverUserId" />
      </div>
      <div class="control-group">
        <label for="message">Сообщение:</label>
        <input id="message" v-model="message" placeholder="Введите сообщение" />
      </div>
      <div class="control-group">
        <div class="button-container">
          <button @click="sendMessage">3. Отправить сообщение</button>
        </div>
      </div>

      <!-- Отключение от сокета -->
      <div class="control-group">
        <div class="button-container">
          <button class="disconnect-button" @click="disconnectFromSocket">4. Отключиться от сокета</button>
        </div>
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Отступ между группами */
  padding: 1.5rem;
  background-color: #1f1f1f; /* Чуть светлее фона для контраста */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Тень для выделения */
  border: 1px solid #333; /* Граница для разделения */
}

.control-group {
  display: flex;

  flex-direction: column; /* Элементы внутри группы располагаются вертикально */
  justify-content: flex-end; /* Прижимаем элементы к правому краю */
  gap: 0.5rem; /* Отступ между элементами внутри группы */
  width: 100%; /* Занимает всю ширину */
}

label {
  color: #e0e0e0; /* Светло-серый цвет текста */
  font-size: 0.9rem;
  text-align: left; /* Подписи выровнены по левому краю */
}

input {
  padding: 0.75rem;
  border: 1px solid #444; /* Темная граница */
  border-radius: 8px;
  background-color: #2a2a2a; /* Темный фон поля ввода */
  color: #ffffff; /* Белый цвет текста */
  text-align: right; /* Выравнивание текста справа */
  width: 100%; /* Занимает всю ширину */
  transition: border-color 0.3s ease;
}

input::placeholder {
  color: #777; /* Серый цвет плейсхолдера */
}

input:focus {
  border-color: #42b983; /* Акцентный цвет при фокусе */
  outline: none;
}

button {
  padding: 0.5rem 1rem; /* Уменьшенный размер кнопок */
  background-color: #42b983; /* Зеленый цвет кнопки по умолчанию */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 50%; /* Занимает всю ширину */
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 0.9rem; /* Уменьшенный размер текста */
}

button:hover {
  transform: scale(1.02); /* Легкое увеличение при наведении */
}

button:active {
  transform: scale(0.98); /* Легкое уменьшение при нажатии */
}

/* Стиль для кнопки "Подключиться к сокету" */
.connect-button {
  background-color: #1e90ff; /* Синий цвет */
}

.connect-button:hover {
  background-color: #1c86ee; /* Темно-синий при наведении */
}

/* Стиль для кнопки "Отключиться от сокета" */
.disconnect-button {
  background-color: #ff4444; /* Красный цвет */
}

.disconnect-button:hover {
  background-color: #ee3b3b; /* Темно-красный при наведении */
}

.button-container {
  display: flex;
  justify-content: flex-end; /* Прижимаем кнопки к правому краю */
  width: 100%;
}

button {
  width: auto; /* Ширина кнопки по содержимому */
  padding: 0.5rem 1rem;
}
</style>