<script setup lang="ts">
import { ref } from 'vue'

const connectionId = ref<string>('test-connection')
const message = ref<string>('')
const eventLog = ref<string[]>([])

let eventSource: EventSource | null = null

// 1. Подключение к SSE
const connectToSSE = () => {
  if (eventSource) {
    eventSource.close()
  }

  eventSource = new EventSource(`http://localhost:9023/sse/web-flux/${connectionId.value}`)

  eventSource.onopen = () => {
    addToLog('SSE соединение установлено')
  }

  eventSource.onmessage = (event) => {
    addToLog(`Получено сообщение: ${event.data}`)
  }

  eventSource.addEventListener('heartbeat', (event) => {
    addToLog(`Heartbeat received: ${event.data}`)
  })

  // eventSource.onerror = () => {
  //   addToLog('Ошибка SSE соединения')
  //   if (eventSource) {
  //     eventSource.close()
  //   }
  // }
  eventSource.onerror = (e) => {
    if (e.eventPhase === EventSource.CLOSED) {
      addToLog('Соединение закрыто сервером')
    } else {
      addToLog('Ошибка соединения: ' + e.message)
    }
    // Автопереподключение
    // setTimeout(connectToSSE, 5000)
  }
}

// 2. Отправка сообщения
const sendMessage = () => {
  if (!message.value.trim()) return

  fetch(
    `http://localhost:9023/sse/web-flux?connectionId=${connectionId.value}&message=${encodeURIComponent(message.value)}`,
    {
      method: 'POST',
    },
  )
    .then((response) => {
      if (response.ok) {
        addToLog(`Сообщение отправлено: ${message.value}`)
        message.value = ''
      } else {
        addToLog('Ошибка при отправке сообщения')
      }
    })
    .catch((error) => {
      addToLog(`Ошибка сети: ${error.message}`)
    })
}

// 3. Отключение от SSE
const disconnectFromSSE = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
    addToLog('SSE соединение закрыто')
  }
}

// 4. Очистка логов
const clearLogs = () => {
  eventLog.value = []
}

// Добавление записи в лог
const addToLog = (text: string) => {
  eventLog.value.push(`${new Date().toLocaleTimeString()}: ${text}`)
}
</script>

<template>
  <header>
    <div class="controls">
      <!-- Подключение к SSE -->
      <div class="control-group">
        <label for="connectionId">ID соединения:</label>
        <input id="connectionId" v-model="connectionId" placeholder="Введите connectionId" />
      </div>
      <div class="control-group">
        <div class="button-container">
          <button class="connect-button" @click="connectToSSE">1. Подключиться к SSE</button>
        </div>
      </div>

      <!-- Отправка сообщения -->
      <div class="control-group">
        <label for="message">Сообщение:</label>
        <input
          id="message"
          v-model="message"
          placeholder="Введите сообщение"
          @keyup.enter="sendMessage"
        />
      </div>
      <div class="control-group">
        <div class="button-container">
          <button @click="sendMessage">2. Отправить сообщение</button>
        </div>
      </div>

      <!-- Управление соединением и логами -->
      <div class="control-group">
        <div class="button-container">
          <button class="disconnect-button" @click="disconnectFromSSE">
            3. Отключиться от SSE
          </button>
        </div>
      </div>
      <div class="control-group">
        <div class="button-container">
          <button class="clear-button" @click="clearLogs">4. Очистить лог</button>
        </div>
      </div>

      <!-- Лог событий -->
      <div class="control-group">
        <label>Лог событий:</label>
        <div class="event-log">
          <div v-for="(logEntry, index) in eventLog" :key="index">{{ logEntry }}</div>
          <div v-if="eventLog.length === 0" class="log-empty">Нет записей в логе</div>
        </div>
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
/* Все оригинальные стили сохранены без изменений */
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
  padding: 0.5rem 1rem;
  background-color: #42b983; /* Зеленый цвет кнопки по умолчанию */
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 50%; /* Занимает всю ширину */
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  font-size: 0.9rem;
}

button:hover {
  transform: scale(1.02); /* Легкое увеличение при наведении */
}

button:active {
  transform: scale(0.98); /* Легкое уменьшение при нажатии */
}

/* Стиль для кнопки "Подключиться к SSE" */
.connect-button {
  background-color: #1e90ff; /* Синий цвет */
}

.connect-button:hover {
  background-color: #1c86ee; /* Темно-синий при наведении */
}

/* Стиль для кнопки "Отключиться от SSE" */
.disconnect-button {
  background-color: #ff4444; /* Красный цвет */
}

.disconnect-button:hover {
  background-color: #ee3b3b; /* Темно-красный при наведении */
}

/* Стиль для кнопки "Очистить лог" */
.clear-button {
  background-color: #ff9500; /* Оранжевый цвет */
}

.clear-button:hover {
  background-color: #e68a00; /* Темно-оранжевый при наведении */
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

.event-log {
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 0.75rem;
  color: #e0e0e0;
  font-family: monospace;
  max-height: 200px;
  overflow-y: auto;
  min-height: 100px;
}

.event-log div {
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #333;
  padding-bottom: 0.25rem;
}

.event-log div:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.log-empty {
  color: #777;
  text-align: center;
  padding: 1rem 0;
}
</style>
