var socket = io.connect('/host')
// 加载组件
const load = {
    props: ['load'],
    template: '#load'
}
// 抽签组件
const random = {
    props: ['players', 'btns'],
    template: '#random',
    data: function () {
        return {
            modeSelect: true,
            auto: false,
            manual: false,
        }
    },
    computed: {
        randomStyle: function () {
            return this.btns.random ? 'btn-random' : 'btn-random--disable'
        }
    },
    methods: {
        getRandom: function () {
            // todo:可能会抽签失败
            socket.emit('draw')
        },
        beginMatch: function () {
            let self = this
            // 告诉后台开始比赛/下一个选手
            $.ajax({
                url: '/api/hosts/beginCompetition',
                type: 'post',
                success: function (msg) {
                    vue.status = 2
                    vue.participant++
                    vue.score = 0
                    console.log('比赛开始')
                    router.push('/matching')
                    // 发送socket
                    socket.emit('nextParticipant')
                },
                error: function (err) {
                    console.log('开始比赛失败')
                }
            })
        },
        autoMode: function () {
            this.modeSelect = false
            this.auto = true
        },
        manualMode: function () {
            this.modeSelect = false
            this.manual = true
        }
    }
}
// 比赛中的组件
const matching = {
    props: ['players', 'btns', 'order'],
    template: '#matching',
    data: function () {
        return {

        }
    },
    computed: {
        getLogo: function () {
            return '../competition/' + this.players[this.order - 1].logo
        }
    },
    methods: {
        beginScoring: function () {
            console.log('23')
            let self = this
            $.ajax({
                url: '/api/hosts/beginScore',
                type: 'post',
                success: function (msg) {
                    console.log(msg)
                    // 发送socket
                    socket.emit('beginScore')
                },
                error: function (err) {
                    console.log(err)
                }
            })
        },
        nextParticipant: function () {
            let self = this
            // 告诉后台开始比赛/下一个选手
            $.ajax({
                url: '/api/hosts/beginParticipant',
                type: 'post',
                success: function (msg) {
                    // 拉取状态
                    vue.status = 2
                    vue.participant++
                    vue.score = 0
                    console.log('下一个选手')
                    // 发送socket
                    socket.emit('nextParticipant')
                },
                error: function (err) {
                    console.log('下一个选手失败')
                }
            })
        }
    }
}

var router = new VueRouter({
    routes: [
        // 默认页面,加载中
        { path: '/', component: load },
        // 控制抽签页面
        { path: '/random', component: random },
        // 控制评分页
        { path: '/matching', component: matching }
    ]
})

var vue = new Vue({
    router,
    el: '#spa',
    data: {
        message: '',
        order: 0,
        // 当前进行到的项目的序号
        participant: 0,
        // 当前比赛状态
        status: -1,
        // 参赛选手
        players: [],
        // 按钮状态
        btnStatus: {
            random: true,
            begin: false,
            score: true
        }
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
            url: '/api/hosts/status',
            type: 'get',
            success: function (data) {
                // todo:
                // 1.判断success
                // 2.如果失败怎么办
                // 3.不知道弃权的队伍会不会有序号，可能要加个判断
                // 4.没有参赛队伍的情况
                console.log(data)
                // 获取比赛进程
                self.status = data.message.status
                self.participant = data.message.participant
                self.score = data.message.score
                // 绑定获取到的数据到Vue实例的data上
                for (let i = 0, len = data.message.participants.length; i < len; i++) {
                    self.players[data.message.participants[i].order - 1] = data.message.participants[i]
                }
                // 跳转到相应页面
                switch (self.status) {
                    case -1:
                        // 加载中(默认)
                        router.push('/')
                        break
                    case 0:
                        // 比赛未开始
                        router.push('/random')
                        break
                    case 1:
                        // 抽签结束，比赛可以开始
                        router.push('/random')
                        break
                    case 2:
                        // 比赛开始
                        router.push('/matching')
                        break
                    case 3:
                        // 比赛结束
                        router.push('/matching')
                }
            },
            error: function () {
                console.log('error')
            }
        })
    }
})
// 监听抽签结束
socket.on('drawn', function () {
    $.ajax({
        url: '/api/hosts/status',
        type: 'get',
        success: function (data) {
            // 获取比赛进程
            vue.status = data.message.status
            vue.participant = data.message.participant
            vue.score = data.message.score
            // 绑定获取到的数据到Vue实例的data上
            for (let i = 0, len = data.message.participants.length; i < len; i++) {
                vue.players[data.message.participants[i].order - 1] = data.message.participants[i]
            }
            // 改变按钮状态
            // todo:改变按钮状态这个,也要弄一个在created拉取状态的时候去赋值
            vue.btnStatus.begin = true
            vue.btnStatus.random = false
        }
    })
})