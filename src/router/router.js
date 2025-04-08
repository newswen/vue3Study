import {createRouter, createWebHistory, createWebHashHistory} from 'vue-router';
import Test from '@/components/Test.vue';  //  改成相对路径
import AsinReportForms from '@/components/AsinReportForms.vue';
import SearchArticle from "@/components/SearchArticle.vue";  //  改成相对路径
import Parent from "@/components/ParentToChild/Parent.vue";
import Child from "@/components/ParentToChild/Child.vue";
import ToRefAndToRefs from "@/components/ToRefAndToRefs/ToRefAndToRefs.vue";
import RouterQuery from "@/components/RouterQuery.vue";

// 存储路由，可以自定义路由，路由规则
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
    },
    {
        path: '/parentToChild/parent',
        name: 'Parent',
        component: Parent,
    },
    {
        path: '/parentToChild/child',
        name: 'Child',
        component: Child,
    },
    {
        path: '/toRefAndToRefs',
        name: 'ToRefAndToRefs',
        component: ToRefAndToRefs
    },
    {
        path: '/routerQuery/:name?',
        name: 'RouterQuery',
        component: RouterQuery
    }
];
// 路由器
const router = createRouter({
    history: createWebHistory(),
    // 上面的路由规则
    routes
});

export default router;