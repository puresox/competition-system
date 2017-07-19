var socket = io('/rater')
// 加载组件
const load = {
    props: ['load'],
    template: '#load'
}
// 等待组件
const wait = {
    props: ['wait'],
    template: '#wait'
}
// 选手信息组件
const player = {
    props: ['players', 'pitems', 'scoring', 'index', 'hasscored'],
    template: '#player',
    data: function () {
        return {
            playerData: '',
            order: 0,
            items: [],
            // 筛选器
            picker: '',
            itemIndex: 0,
            btns: {
                message: true,
                score: false
            }
        }
    },
    computed: {
        // todo:后期可能要加个改变样式
        prePlayer: function () {
            var order = parseInt(this.$route.params.order)
            return '/player/' + (order > 1 ? order - 1 : 1)
        },
        nextPlayer: function () {
            var order = parseInt(this.$route.params.order)
            return '/player/' + (order < this.players.length ? order + 1 : this.players.length)
        },
        canSubmit: function () {
            if (this.order < this.index) {
                return 1
            } else if (this.order == this.index && this.scoring == 1) {
                return 2
            } else if (this.order > this.index) {
                return 3
            } else if (this.order == this.index && this.scoring == 0) {
                return 4
            } else if (this.order == this.index && this.hasscored == 1) {
                return 1
            }
        },
        getLogo: function () {
            return '../competition/' + this.players[this.$route.params.order - 1].logo
        },
        getTotalScore: function () {
            // todo:这里先记着,items过长的情况还没测试
            let totalScore = 0
            for (let i = 0, len = this.items.length; i < len; i++) {
                if (typeof (this.players[this.$route.params.order - 1].scores[i].score) == 'number') {
                    totalScore += this.players[this.$route.params.order - 1].scores[i].score
                }
            }
            return totalScore
        }
    },
    created: function () {
        this.playerData = this.players[this.$route.params.order - 1]
        this.items = this.pitems
        this.order = this.$route.params.order
        // 生成筛选器
        let data = []
        for (let i = 0; i < 100; i++) {
            data[i] = {
                text: (i + 1).toString(),
                value: (i + 1)
            }
        }
        this.picker = new Picker({
            data: [data],
            selectedIndex: [0],
            title: '请选择分数'
        })
        let self = this
        this.picker.on('picker.select', function (selectedVal, selectedIndex) {
            // 将选择结果传递回父组件
            self.$emit('select', selectedVal[0], self.itemIndex)
        })
    },
    // 监听路由的变化
    watch: {
        '$route': 'updateData'
    },
    methods: {
        updateData: function () {
            this.playerData = this.players[this.$route.params.order - 1]
            this.order = this.$route.params.order
            this.btns.message = true
            this.btns.score = false
        },
        // todo:如果有未打分项,不给提交并提示
        select: function (index) {
            // 按照该项的最高分重新填充筛选器
            let data = []
            for (let i = 0, len = this.items[index].value; i < len; i++) {
                data[i] = {
                    text: (i + 1).toString(),
                    value: (i + 1)
                }
            }
            let picker = this.picker
            let func = this.picker.refillColumn
            let item = this.items[index].name
            // 显示筛选器并重新填东西
            this.picker.show(function () {
                $('.picker-title').text(item)
                func.call(picker, 0, data)
            })
            this.itemIndex = index
        },
        submit: function () {
            // todo:1.未填分数确认2.分数弹窗再次确认3.提交之后按钮的变化(只能提交一次)
            if (!confirm('确定要提交成绩?')) {
                return
            }
            let self = this
            $.ajax({
                url: '/api/raters/score/',
                type: 'post',
                data: {
                    scores: JSON.stringify(self.playerData.scores)
                },
                success: function (msg) {
                    console.log('提交成绩成功')
                    socket.emit('endScore')
                    self.hasScored = 1
                },
                error: function (err) {
                    alert('提交成绩失败,请重新提交')
                    console.log('提交失败')
                }
            })
        },
        toMessage: function () {
            this.btns.message = true
            this.btns.score = false
        },
        toScore: function () {
            this.btns.score = true
            this.btns.message = false
        },
        test: function () {
            console.log('成功触发子组件事件')
        }
    }
}

// 路由
const router = new VueRouter({
    routes: [
        // 默认页面,加载中
        { path: '/', component: load },
        // 等待页,等待抽签完成
        { path: '/wait', component: wait },
        // 评分页,对各个项目进行评分
        { path: '/player/:order', component: player }
    ]
})

var vue = new Vue({
    router,
    el: '#spa',
    data: {
        // 路由
        routes: [],
        // 参赛项目
        players: [],
        // 评分项
        items: [],
        // 分数
        scores: [],
        // 当前进行到的项目的序号
        participant: 0,
        // 当前比赛状态
        status: -1,
        // 打分状态
        score: 0,
        // 当前浏览器视图所在的序号（估计没用）
        viewOrder: 0,
        // 预留, 暂时没用
        message: '',
        isscore: 0,
        // 显示导航栏(暂时没用)
        nav: false,
        btnStatus: {
            submit: false
        }
    },
    computed: {
    },
    methods: {
        selectScore: function (score, index) {
            this.players[this.participant - 1].scores[index].score = score
        }
    },
    beforeCreate: function () {
        router.push('/')
    },
    created: function () {
        var self = this
        $.ajax({
            url: '/api/raters/status',
            type: 'get',
            success: function (msg) {
                // todo:1.如果还没有顺序
                console.log(msg)
                // 获取比赛进程
                self.status = msg.message.status
                self.participant = msg.message.participant
                self.score = msg.message.score
                self.isscore = msg.message.isscore
                // 绑定获取到的数据到Vue实例的data上
                // 两种情况
                // 1.系统status=0时,未生成顺序,直接拉取players绑定到Vue上
                // 2.status>0时,已生成顺序,拉取之后还要按顺序填进数组
                if (self.status == 0) {
                    self.players = msg.message.participants
                } else {
                    for (let i = 0, len = msg.message.participants.length; i < len; i++) {
                        // 绑定获取到的数据到Vue实例的players上
                        self.players[msg.message.participants[i].order - 1] = msg.message.participants[i]
                        // 设置每个参赛项目的url
                        self.routes[msg.message.participants[i].order - 1] = {
                            name: msg.message.participants[i].name,
                            url: '/player/' + msg.message.participants[i].order
                        }
                    }
                }
                // 获取评分项
                self.items = msg.message.items
                // 初始化每个player的scores
                for (let i = 0, len = self.players.length; i < len; i++) {
                    self.players[i].scores = []
                    for (let i2 = 0, len2 = self.items.length; i2 < len2; i2++) {
                        self.players[i].scores[i2] = {
                            item: self.items[i2]._id,
                            score: '点击选择成绩'
                        }
                    }
                }
                let scores = msg.message.scores

                // status!=0时,拉取成绩
                if (self.status != 0) {
                    for (let i = 0, len = scores.length; i < len; i++) {
                        self.players[i].scores = scores[i].scores
                    }
                }
                // 跳转到相应页面
                switch (self.status) {
                    case -1:
                        router.push('/')
                        break
                    case 0:
                        // 未开始,等待抽签
                        router.push('/wait')
                        break
                    case 1:
                        // 抽签完了,主持人没点开始
                        router.push('/wait')
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
                alert('从系统获取数据失败,点击确定重新加载')
                window.location.reload()
                console.log(err)
            }
        })
    }
})
// // 监听抽签结束
// socket.on('drawn', function () {
//     $.ajax({
//         url: '/api/raters/status',
//         type: 'get',
//         success: function (msg) {
//             vue.status = msg.message.status
//             vue.participant = msg.message.participant
//             for (let i = 0, len = msg.message.participants.length; i < len; i++) {
//                 // 绑定获取到的数据到Vue实例的players上
//                 vue.players[msg.message.participants[i].order - 1] = msg.message.participants[i]
//             }
//         }
//     })
// })
// // 监听比赛开始(下一个选手)
// socket.on('getStatus', function () {
//     vue.status = 2
//     vue.participant++
//     router.push('/player/' + vue.participant)
// })

// 监听抽签结束
socket.on('drawn', function () {
    $.ajax({
        url: '/api/raters/status',
        type: 'get',
        success: function (msg) {
            vue.status = msg.message.status
            vue.participant = msg.message.participant
            for (let i = 0, len = msg.message.participants.length; i < len; i++) {
                // 绑定获取到的数据到Vue实例的players上
                vue.players[msg.message.participants[i].order - 1] = msg.message.participants[i]
            }
        },
        error: function () {
            alert('获取抽签结果失败,点击确定刷新页面')
            window.location.reload()
        }
    })
})
// todo:可能要做的.等待分两种1.等待抽签结束2.等待主持人开始比赛
// 监听开始比赛/下一个选手
socket.on('nextParticipant', function () {
    vue.status = 2
    vue.participant++
    router.push('/player/' + vue.participant)
})
// 监听开始打分
socket.on('beginScore', function () {
    vue.score = 1
})