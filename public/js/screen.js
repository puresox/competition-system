var socket = io.connect('/screen')

const load = {
    props: ['load'],
    template: '#load'
}

const ready = {
    props: ['ready'],
    template: '#ready'
}

const random = {
    props: ['random'],
    template: '#random'
}

const match = {
    props: ['match'],
    template: '#match'
}

const over = {
    props: ['over'],
    template: '#over'
}

var router = new VueRouter({
    routes: [
        // 默认页面,加载中
        { path: '/', component: load },
        // 大赛装逼页
        { path: '/ready', component: ready },
        // 抽签页
        { path: '/random', component: random },
        // 比赛中页
        { path: '/match', component: match },
        // 结束页
        { path: '/over', component: over }
    ]
})

var vue = new Vue({
    router,
    el: '#spa',
    data: {
        players: [],
        // 当前进行到的项目的序号
        participant: 0,
        // 当前比赛状态
        status: -1,
    },
    computed: {
    },
    methods: {
        add: function (msg) {
            console.log(msg)
        }
    },
    beforeCreate: function () {
        router.push('/')
    },
    created: function () {
        let self = this
        $.ajax({
            url: '/api/screen/status',
            type: 'get',
            success: function (msg) {
                console.log(msg)
                // 绑定获取到的数据到Vue实例的data上
                for (let i = 0, len = msg.message.participants.length; i < len; i++) {
                    self.players[i] = msg.message.participants[i]
                }
                // 获取当前比赛进程
                // 并跳转到相应页面
                self.status = msg.message.status
                self.participant = msg.message.participant
                switch (self.status) {
                    case -1:
                        // 加载中
                        router.push('/')
                        break
                    case 0:
                        // 未开始,等待抽签
                        router.push('/ready')
                        break
                    case 1:
                        // 抽签完了,主持人没点开始
                        router.push('/random')
                        break
                    case 2:
                        // 比赛正式开始
                        // 跳转到响应的选手页
                        // switch (self.participant) {
                        //     default: router.push('/player/' + (self.participant + 1))
                        // }
                        break
                    case 3:
                        // 比赛结束
                        break
                    default:
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
})
