import {createRouter, createWebHistory} from 'vue-router';
import Test from '@/components/Test.vue';  //  改成相对路径
import AsinReportForms from '@/components/AsinReportForms.vue';
import SearchArticle from "@/components/SearchArticle.vue";  //  改成相对路径

const routes = [
    {
        path: '/',
        name: 'AsinReportForms',
        component: AsinReportForms
    },
    {
        path: '/test',
        name: 'Test',
        component: Test
    },
    {
        path: '/searchArticle',
        name: 'SearchArticle',
        component: SearchArticle
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;