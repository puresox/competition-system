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
    props: ['players', 'randomed'],
    template: '#random',
    data: function () {
        return {
            men: []
        }
    },
    created: function () {
        for (let i = 0; i < 50; i++) {
            this.men[i] = '小马停车'
        }
    },
}

const player = {
    props: ['players', 'scoring', 'allscore', 'num'],
    template: '#player',
    data: function () {
        return {
            playerData: '',
            order: 0,
            itemIndex: 0,
            showing: true,
        }
    },
    computed: {
        totalScore: function () {
            let result = 0
            for (let i = 0, len = this.allscore.length; i < len; i++) {
                result += this.allscore[i]
            }
            return result
        },
        getLogo: function () {
            return '../competition/' + this.players[this.$route.params.order - 1].logo
        }
    },
    // 监听路由的变化
    watch: {
        '$route': 'updateData'
    },
    methods: {
        updateData: function () {
            this.playerData = this.players[this.$route.params.order - 1]
            this.order = this.$route.params.order
        }
    },
    created: function () {
        this.playerData = this.players[this.$route.params.order - 1]
        this.order = this.$route.params.order
    },
}

const over = {
    props: ['over', 'ranks'],
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
        { path: '/player/:order', component: player },
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
        score: 0,
        // 当前项目的所有成绩
        scores: [],
        ratersNum: 0,
        randomReady: false,
        rank: []
    },
    computed: {
    },
    methods: {
        getRandom: function () {
            let self = this
            // 序号库
            var defaultOrders = []
            // 结果
            var result = []
            // 两个for生成随机排序
            for (let i = 0, len = self.players.length; i < len; i++) {
                defaultOrders[i] = i + 1
            }
            for (let i = 0, len = self.players.length; i < len; i++) {
                let index = Math.round(Math.random() * (defaultOrders.length - 1))
                result[i] = {
                    id: self.players[i]._id,
                    order: defaultOrders[index]
                }
                defaultOrders.splice(index, 1)
            }
            console.log(result)
            // 切换到抽签页
            router.push('/random')
            // todo:如果这个ajax卡住怎么办
            $.ajax({
                url: '/api/screen/draw',
                type: 'post',
                data: {
                    participants: JSON.stringify(result)
                },
                success: function (msg) {
                    vue.randomReady = true
                    // todo:
                    // 1.判断成功
                    // 2.只有收到错误返回才能再次点击
                    // 把生成的序号更新到vue中的players
                    console.log('生成序号成功')
                    for (let i = 0, len = self.players.length; i < len; i++) {
                        for (let i2 = 0, len2 = result.length; i2 < len2; i2++) {
                            if (result[i2].id == self.players[i]._id) {
                                self.players[i].order = result[i2].order
                            }
                        }
                    }
                    // 更新self.players(数组顺序按order的顺序重新排列)
                    let players = []
                    for (let i = 0, len = result.length; i < len; i++) {
                        for (let i2 = 0, len2 = self.players.length; i2 < len2; i2++) {
                            if (self.players[i2]._id == result[i].id) {
                                players[result[i].order - 1] = self.players[i2]
                            }
                        }
                    }
                    self.players = players
                    // 发socket通知host,rater,抽签完毕,可以开始比赛了
                    socket.emit('autoDrawn')
                },
                error: function (err) {
                    console.log(err)
                }
            })
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
                // 获取比赛进程
                self.status = msg.message.status
                self.participant = msg.message.participant
                self.score = msg.message.score
                self.ratersNum = msg.message.ratersNum
                // 绑定获取到的数据到Vue实例的data上
                // 两种情况
                // 1.系统status=0时,未生成顺序,直接拉取players绑定到Vue上
                // 2.status>0时,已生成顺序,拉取之后还要按顺序填进数组
                if (self.status == 0) {
                    self.players = msg.message.participants
                } else {
                    for (let i = 0, len = msg.message.participants.length; i < len; i++) {
                        self.players[msg.message.participants[i].order - 1] = msg.message.participants[i]
                    }
                }
                // 生成排名
                this.rank = msg.message.participants
                for (let i = 0, len = this.rank.length; i < len; i++) {
                    if (!this.rank[i].score) {
                        this.rank[i].score = 0
                    }
                }
                this.rank.sort(function (a, b) {
                    if (a.score > b.score) {
                        return -1
                    }
                    if (a.score < b.score) {
                        return 1
                    }
                    return 0
                })
                // 这个只是为了抽签动画
                if (self.status > 0) {
                    vue.randomReady = true
                }
                if (msg.message.scores.length == msg.message.ratersNum && msg.message.score == 1) {
                    $.ajax({
                        // todo:断线重连情况没考虑
                        url: '/api/screen/score',
                        type: 'post',
                        success: function (msg) {
                            console.log('评分完毕')
                            socket.emit('endParticipant')
                            socket.emit('updateRank')
                            vue.score = 2
                        },
                        error: function (err) {

                        }
                    })
                }
                self.scores = msg.message.scores
                // 跳转到相应页面
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
                        // 1.如果是从0到1的话,进入这个页面开始摇骰子
                        // 2.如果直接进入status已是1,直接进入这个页面,则直接打印排序
                        router.push('/random')
                        break
                    case 2:
                        // 比赛正式开始
                        // 跳转到响应的选手页
                        switch (self.participant) {
                            default: router.push('/player/' + (self.participant))
                        }
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

// // 监听开始抽签的命令
// socket.on('draw', function () {
//     // 改变vue中存储的status
//     // todo:getRandom可能会不成功
//     vue.status = 1
//     vue.getRandom()
//     // 切换到抽签页
//     router.push('/random')
// })
// // 获取状态
// socket.on('getStatus', function () {
//     $.ajax({
//         url: '/api/screen/status',
//         type: 'get',
//         success: function (msg) {
//             vue.status = msg.message.status
//             vue.participant = msg.message.participant
//             vue.score = msg.message.score
//             vue.players[vue.participant].allScores = msg.message.scores
//         },
//         error: function (err) {
//             console.log(err)
//         }
//     })
//     router.push('/player/' + vue.participant)
// })
// 监听开始抽签的命令
socket.on('autoDraw', function () {
    // todo:可能所有按钮都要加个弹窗
    // 改变vue中存储的status
    // todo:getRandom可能会不成功
    vue.status = 1
    vue.getRandom()
})
// 监听手动抽签完成
socket.on('manuDrawn', function () {
    vue.status = 1
    $.ajax({
        url: '/api/screen/status',
        type: 'get',
        success: function (msg) {
            vue.status = msg.message.status
            vue.participant = msg.message.participant
            vue.score = msg.message.score
            vue.players = msg.message.participants
            vue.randomReady = true
        },
        error: function (err) {

        }
    })
    router.push('/random')
})
// 监听开始比赛/下一个选手
socket.on('nextParticipant', function () {
    vue.status = 2
    vue.participant++
    vue.score = 0
    vue.scores = []
    router.push('/player/' + vue.participant)
})
// 监听开始打分
socket.on('beginScore', function () {
    vue.score = 1
})
// 监听单个评委打分完成
socket.on('endScore', function () {
    $.ajax({
        url: '/api/screen/status',
        type: 'get',
        success: function (msg) {
            vue.status = msg.message.status
            vue.participant = msg.message.participant
            vue.score = msg.message.score
            // vue.players[vue.participant - 1].allScores = msg.message.scores
            vue.scores = msg.message.scores
            if (msg.message.scores.length == msg.message.ratersNum) {
                $.ajax({
                    // todo:断线重连情况没考虑
                    url: '/api/screen/score',
                    type: 'post',
                    success: function (msg) {
                        console.log('评分完毕')
                        socket.emit('endParticipant')
                        vue.score = 2
                    },
                    error: function (err) {

                    }
                })
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
})
// 结束比赛
socket.on('end', function () {
    $.ajax({
        url: '/api/screen/status',
        type: 'get',
        success: function (msg) {
            vue.rank = msg.message.participants
            // 有的没有成绩,置零处理
            for (let i = 0, len = vue.rank.length; i < len; i++) {
                if (!vue.rank[i].score) {
                    vue.rank[i].score = 0
                }
            }
            vue.rank.sort(function (a, b) {
                if (a.score > b.score) {
                    return -1
                }
                if (a.score < b.score) {
                    return 1
                }
                return 0
            })
            for (let i = 0, len = vue.rank.length; i < len; i++) {
                if (vue.rank[i].score == 0) {
                    vue.rank[i].score = '-'
                }
            }
            router.push('/over')
        },
        error: function (err) {

        }
    })
})