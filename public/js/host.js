var socket = io.connect('/host')
// 加载组件
const load = {
    props: ['load'],
    template: '#load'
}
// 抽签组件
const random = {
    props: ['players'],
    template: '#random',
    data: function () {
        return {
            begin: false,
        }
    },
    methods: {
        getRandom: function () {
            // ajax请求
            var defaultOrders = []
            var result = []
            for (let i = 0, len = this.players.length; i < len; i++) {
                defaultOrders[i] = i + 1
            }
            for (let i = 0, len = this.players.length; i < len; i++) {
                let index = Math.round(Math.random() * (defaultOrders.length - 1))
                result[i] = {
                    id: this.players[i]._id,
                    order: defaultOrders[index]
                }
                defaultOrders.splice(index, 1)
            }
            let self = this
            $.ajax({
                url: '/api/screen/draw',
                type: 'post',
                data: {
                    participants: JSON.stringify(result)
                },
                success: function (msg) {
                    // todo:
                    // 1.判断成功
                    // 2.只有收到错误返回才能再次点击

                    // 发给父组件
                    self.$emit('test', result)
                    // 发送socket到sever
                    socket.emit('drawn')
                },
                error: function (err) {
                    console.log(err)
                }
            })
        },
        beginMatch: function () {
            this.$emit('test')
            $.ajax({
                url: '/api/hosts/beginCompetition',
                type: 'post',
                success: function (msg) {
                    console.log('比赛开始')
                },
                error: function (err) {
                    console.log('比赛开始失败')
                }
            })
            router.push('/matching')
        }
    }
}
// 比赛中的组件
const matching = {
    props: ['players'],
    template: '#matching'
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
        players: []
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
                // 绑定获取到的数据到Vue实例的data上
                for (let i = 0, len = data.message.participants.length; i < len; i++) {
                    self.players[i] = data.message.participants[i]
                }
                // 获取当前比赛进程
                // 并跳转到相应页面
                self.status = data.message.status
                self.participant = data.message.participant
                switch (self.status) {
                    case -1:
                        // 加载中(默认)
                        router.push('/')
                        break
                    case 0:
                        // 骰子不转,比赛开始按钮不显示
                        router.push('/random')
                        break
                    case 1:
                        // 骰子转,比赛开始按钮不显示
                        router.push('/random')
                        break
                    case 2:
                        // 骰子不转,比赛开始按钮出现
                        router.push('/random')
                        break
                    case 3:
                        // 比赛进行时
                        router.push('/matching')
                }
            },
            error: function () {
                console.log('error')
            }
        })
    }
})