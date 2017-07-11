// const player = {
//     props: ['player'],
//     template: '#test',
//     data: function () {
//         return {
//             data: '哈哈'
//         }
//     },
//     watch: {
//         '$route': 'getNew'
//     },
//     mounted: function () {
//         this.userId = this.$route.params.name
//     },
//     methods: {
//         getNew: function () {
//             this.data = this.player['1']
//         }
//     }
// }

// const router = new VueRouter({
//     routes: [
//         { path: '/player/:name', component: player }
//     ]
// })

// Vue.component('player-panel', {
//     template: '#test'
// })

// var vue = new Vue({
//     router,
//     el: '#spa',
//     data: {
//         message: '测试',
//         routes: [{
//             name: '一号选手',
//             url: '/player/一号选手'
//         }, {
//             name: '二号选手',
//             url: '/player/二号选手'
//         }, {
//             name: '三号选手',
//             url: '/player/三号选手'
//         }],
//         playerData: {}
//     },
//     created: function () {
//         // 假设这个是获取的选手数据
//         var playerData = [{
//             name: '小马智停',
//             order: 2
//         }, {
//             name: '大棚',
//             order: 3
//         }, {
//             name: '视翼VR',
//             order: 1
//         }]
//         for (let i = 0, len = playerData.length; i < len; i++) {
//             this.playerData[playerData[i].order.toString()] = playerData[i]
//         }
//         console.log(this.playerData)
//     }
// })

const player = {
    props: ['players'],
    template: '#test',
    data: function () {
        return {
            playerData: '',
            userId: ''
        }
    },
    created: function () {
        this.playerData = this.players[this.$route.params.order - 1]
    },
    // 监听路由的变化
    watch: {
        '$route': 'updateData'
    },
    methods: {
        updateData: function () {
            this.playerData = this.players[this.$route.params.order - 1]
        }
    }
}

const router = new VueRouter({
    routes: [
        { path: '/player/:order', component: player }
    ]
})

var vue = new Vue({
    router,
    el: '#spa',
    data: {
        message: '',
        routes: [],
        players: []
    },
    created: function () {
        // 假设这个是获取的选手数据
        var data = [{
            name: '小马智停',
            intro: '这部分是介绍',
            order: 2
        }, {
            name: '大棚',
            intro: '这部分是介绍',
            order: 3
        }, {
            name: '视翼VR',
            intro: '这部分是介绍',
            order: 1
        }]
        // todo:不知道弃权的队伍会不会有序号，可能要加个判断
        for (let i = 0, len = data.length; i < len; i++) {
            // 绑定获取到的数据到Vue实例的data上
            this.players[data[i].order - 1] = data[i]
            // 设置每个参赛项目的url
            this.routes[data[i].order - 1] = {
                name: data[i].name,
                url: '/player/' + data[i].order
            }
        }
    }
})
