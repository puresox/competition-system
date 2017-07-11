const player = {
    props: ['player'],
    template: '#test',
    data: function () {
        return {
            data: '哈哈'
        }
    },
    watch: {
        '$route': 'getNew'
    },
    mounted: function () {
        this.userId = this.$route.params.name
    },
    methods: {
        getNew: function () {
            this.data = this.player['1']
        }
    }
}

const router = new VueRouter({
    routes: [
        { path: '/player/:name', component: player }
    ]
})

Vue.component('player-panel', {
    template: '#test'
})

var vue = new Vue({
    router,
    el: '#spa',
    data: {
        message: '测试',
        routes: [{
            name: '一号选手',
            url: '/player/一号选手'
        }, {
            name: '二号选手',
            url: '/player/二号选手'
        }, {
            name: '三号选手',
            url: '/player/三号选手'
        }],
        playerData: {}
    },
    created: function () {
        // 假设这个是获取的选手数据
        var playerData = [{
            name: '小马智停',
            order: 2
        }, {
            name: '大棚',
            order: 3
        }, {
            name: '视翼VR',
            order: 1
        }]
        for (let i = 0, len = playerData.length; i < len; i++) {
            this.playerData[playerData[i].order.toString()] = playerData[i]
        }
        console.log(this.playerData)
    }
})