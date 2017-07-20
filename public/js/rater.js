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
    props: ['players', 'pitems', 'titem', 'scoring', 'index', 'hasscored'],
    template: '#player',
    data: function () {
        return {
            playerData: '',
            order: 0,
            items: [],
            totalItem: [],
            itemtype: 1,
            // 筛选器
            picker: '',
            itemIndex: 0,
            btns: {
                message: true,
                score: false
            },
            checked: false
        }
    },
    watch: {
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
            let order = parseInt(this.order)
            if (order < this.index) {
                return 1
            } else if (order == this.index && this.scoring == 1 && this.hasscored != 1) {
                return 2
            } else if (order > this.index) {
                return 3
            } else if (order == this.index && this.scoring == 0) {
                return 4
            } else if (order == this.index && this.hasscored == 1) {
                return 1
            } else if (order == this.index && this.scoring == 2) {
                return 1
            }
        },
        getLogo: function () {
            return '../competition/' + this.players[this.$route.params.order - 1].logo
        },
        getTotalScore: function () {
            // todo:这里先记着,items过长的情况还没测试
            let totalScore = 0
            if (this.checked) {
                if (typeof (this.players[this.$route.params.order - 1].totalScore.score) == 'number') {
                    totalScore = this.players[this.$route.params.order - 1].totalScore.score
                }
            } else {
                for (let i = 0, len = this.items.length; i < len; i++) {
                    if (typeof (this.players[this.$route.params.order - 1].scores[i].score) == 'number') {
                        totalScore += this.players[this.$route.params.order - 1].scores[i].score
                    }
                }
            }
            return totalScore
        }
    },
    created: function () {
        this.playerData = this.players[this.$route.params.order - 1]
        this.items = this.pitems
        this.totalItem = this.titem
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
            self.$emit('select', selectedVal[0], self.itemIndex, self.checked)
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
            this.checked = false
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
            let itemName = this.items[index].name
            // 显示筛选器并重新填东西
            this.picker.show(function () {
                $('.picker-title').text(itemName)
                func.call(picker, 0, data)
            })
            this.itemIndex = index
        },
        selectAll: function () {
            let data = []
            for (let i = 0, len = this.totalItem[0].value; i < len; i++) {
                data[i] = {
                    text: (i + 1).toString(),
                    value: (i + 1)
                }
            }
            let picker = this.picker
            let func = this.picker.refillColumn
            let itemName = this.totalItem[0].name
            // 显示筛选器并重新填东西
            this.picker.show(function () {
                $('.picker-title').text(itemName)
                func.call(picker, 0, data)
            })
            this.itemIndex = 0
        },
        submit: function () {
            // todo:1.未填分数确认2.分数弹窗再次确认3.提交之后按钮的变化(只能提交一次)
            for (let i = 0, len = this.pitems.length; i < len && !this.checked; i++) {
                if (typeof (vue.players[vue.participant - 1].scores[i].score) != 'number') {
                    alert('还有未填写成绩的项目')
                    return
                }
            }
            if (this.checked && typeof (vue.players[vue.participant - 1].totalScore.score) != 'number') {
                alert('总成绩不能为空')
                return
            }
            if (!confirm('确定要提交成绩?')) {
                return
            }
            let self = this
            let result = this.checked ? self.playerData.totalScore : self.playerData.scores
            $.ajax({
                url: '/api/raters/score/',
                type: 'post',
                data: {
                    scores: JSON.stringify(result)
                },
                success: function (msg) {
                    console.log('提交成绩成功')
                    socket.emit('endScore')
                    vue.isscore = 1
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

const over = {
    props: ['over'],
    template: '#over'
}

// 路由
const router = new VueRouter({
    routes: [
        // 默认页面,加载中
        { path: '/', component: load },
        // 等待页,等待抽签完成
        { path: '/wait', component: wait },
        // 评分页,对各个项目进行评分
        { path: '/player/:order', component: player },
        // 结束页
        { path: '/over', component: over }
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
        // 评分项(除了总分)
        items: [],
        // 总分
        totalItem: [],
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
        },
        rank: [],
        showMenu: false
    },
    computed: {
        isMenu: function () {
            return {
                'menu-hide': !this.showMenu,
                'menu-show': this.showMenu
            }
        }
    },
    methods: {
        selectScore: function (score, index, checked) {
            if (checked) { // 总成绩
                this.players[this.participant - 1].totalScore.score = score
            } else { //多个小成绩
                this.players[this.participant - 1].scores[index].score = score
            }
        },
        callMenu: function () {
            this.showMenu = !this.showMenu
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
                // 获取评分项
                self.items = msg.message.items
                // 把总分这个选项给抠出来
                for (let i = 0; ; i++) {
                    if (!self.items[i]) {
                        break
                    }
                    if (self.items[i].name == '总分') {
                        self.totalItem = self.items.splice(i, 1)
                    }
                }
                // 初始化每个player的scores
                for (let i = 0, len = self.players.length; i < len; i++) {
                    self.players[i].totalScore = {
                        item: self.totalItem[0]._id,
                        score: '点击选择总成绩'
                    }
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
                        if (scores[i].scores[0].item.name == '总分') {
                            self.players[i].totalScore = scores[0].scores[0]
                        } else {
                            self.players[i].scores = scores[i].scores
                        }
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
socket.on('autoDrawn', function () {
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
    vue.score = 0
    vue.isscore = 0
    if (vue.participant > vue.players.length) {
        router.push('/over')
    } else {
        router.push('/player/' + vue.participant)
    }
    window.location.reload()
})
// 监听开始打分
socket.on('beginScore', function () {
    vue.score = 1
})
// 结束比赛
socket.on('end', function () {
    $.ajax({
        url: '/api/raters/status',
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
            alert('获取最终排名失败,点击确定刷新页面')
            window.location.reload()
        }
    })
})