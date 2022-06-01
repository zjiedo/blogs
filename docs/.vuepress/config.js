module.exports = {
    head: [
        ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no'}],
        ['link', {rel: 'icon', href: 'favicon.ico'}]
    ],
    base: '/blogs/', // 部署到GitHub相关的配置
    theme: 'reco',
    title: 'Jill\'s Blogs',
    description: 'Hello Jill! Hello World!',
    plugins: {
        '@vuepress/medium-zoom': {
            selector: 'img.zoom-custom-imgs',
            // medium-zoom options here
            // See: https://github.com/francoischalifour/medium-zoom#options
            options: {
                margin: 16
            }
        }
    },
    markdown: {
        lineNumbers: false  // 代码块不显示行号
    },
    themeConfig: {
        huawei: true,
        type: 'blog',
        author: 'Jill',
        // valine
        valineConfig: {
            enable: true,
            appId: 'AOMCoOm6HdJz0YClzKHGq2Qk-gzGzoHsz',// your appId
            appKey: 'wMmTwCgtj6KkzzFIFc0LFifl', // your appKey
            notify: true,
            verify: true,
            avatar:'mp',
            placeholder: '填写邮箱可以收到回复提醒哦',
            visitor: true, // 阅读量统计
            pageSize: 10,
            visitor: false,
            comment_count: true,
        },
        nav: [
            {text: 'Home', link: '/'},
            {text: '前端', link: '/web/', items: [
                    {text: 'es6', link: '/web/es6/custom_promise.md'},
                    {text: 'webpack', link: '/web/webpack/webpack_splitChunk.md'},
                    {text: 'vue', link: '/web/vue/custom-vue-router.md'},
                ]
            },
            {text: 'nodejs', link: '/node/'},
            {text: '关于', link: '/nested/',icon: 'account_circle'},
        ],
        sidebar: {
            '/web/es6/': ['custom_promise'],
            '/web/webpack/': ['webpack_splitChunk'],
            '/web/vue/' : ['custom-vue-router'],
        },
        // 博客设置
        blogConfig: {
            category: {
                location: 6,     // 在导航栏菜单中所占的位置，默认2
                text: 'Category' // 默认文案 “分类”
            },
            tag: {
                location: 5,     // 在导航栏菜单中所占的位置，默认3
                text: 'Tag'      // 默认文案 “标签”
            }
        },
        sidebarDepth: 2, // 侧边栏显示2级
        // algolia: {  // 搜索需要提交
        //     apiKey: '<API_KEY>',
        //     indexName: '<INDEX_NAME>'
        // },
        search: true,
        searchMaxSuggestions: 10,
        lastUpdated: 'Last Updated', // string | boolean
        // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
        repo: 'zjiedo/blogs',
        // 以下为可选的编辑链接选项
        // 假如文档不是放在仓库的根目录下：
        docsDir: 'docs',
        // 默认是 false, 设置为 true 来启用
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页',
        // Service Worker 的配置
        serviceWorker: {
            updatePopup: {
                message: "发现新内容可用.",
                buttonText: "刷新"
            }
        }
    }
};

