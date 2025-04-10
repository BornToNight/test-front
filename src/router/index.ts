import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/web-socket',
      name: 'web-socket',
      component: () => import('../views/WebSocketView.vue'),
    },
    {
      path: '/sse',
      name: 'sse',
      component: () => import('../views/SseView.vue'),
    },
    {
      path: '/sse/web-flux',
      name: 'sseWebFlux',
      component: () => import('../views/SseWebFluxView.vue'),
    },
  ],
})

export default router
