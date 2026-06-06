import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Metting from '@/views/Metting.vue'
import RealMetting from '@/views/RealMetting.vue'
import AiChartAnalysis from '@/views/AiChartAnalysis.vue'
import TemplateManage from '@/views/TemplateManage.vue'
import CodeManage from '@/views/CodeManage.vue'
import UserManage from '@/views/UserManage.vue'
import Inquiry from '@/views/Inquiry.vue'

const routes = [
  { path: '/', redirect: '/realMetting' },
  { path: '/dashboard', component: Home },
  { path: '/aiChartAnalysis', component: AiChartAnalysis },
  { path: '/metting', component: Metting },
  { path: '/realMetting', component: RealMetting },
  { path: '/inquiry', component: Inquiry },
  { path: '/templateManage', component: TemplateManage },
  { path: '/codeManage', component: CodeManage },
  { path: '/userManage', component: UserManage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
